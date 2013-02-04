---
layout: post
title: "Using Rake in .NET Projects"
date: 2013-02-03 16:36
comments: true
categories: ["rake", "ruby", "automation"]
---
This article will demonstrate how I have utilized Ruby [Rake](http://rake.rubyforge.org/), the [Albacore](https://github.com/derickbailey/Albacore) task library, and a few other Ruby gems for build automation in my .NET projects. Hopefully this will be a good source to help those wishing to do the same. Keep in mind that this is not a beginner&#8217;s guide and assumes you are already somewhat familiar with Rake. For those that prefer a more "hands-on" approach, the **[source code](https://gitlab.wearesoftwarecraftsmen.com/public)** for this article can be found with my other [public projects](https://gitlab.wearesoftwarecraftsmen.com/public). <!--More--> 

The Goals
----------------------------
Before writing any Ruby, it&#8217;s important to determine exactly what it is you are trying to automate with Rake. This will serve as a guide in what and how you write your Rake tasks. I set out with the following goals in mind:

* Compile the .NET project
* Run all [Mspec test specifications]({% post_url 2013-01-19-getting-started-with-mspec-machine-dot-specifications %}) for  project
	* Fail the build if any test specifications do not pass
* Generate AssemblyInfo.cs files with project information and version number
	* Include the commit sha with the version information in the AssemblyInfo.cs file
* Pull current version from git source control
* Be able to increment a major and minor version for a build
* Output all project <abbr title="Dynamic Link Library">DLL</abbr>s **not** associated with specification tests to build and release output folders
* Be able to optionally merge all project <abbr title="Dynamic Link Library">DLL</abbr>s **not** associated with specification tests into one <abbr title="Dynamic Link Library">DLL</abbr> for distribution
* Optionally be able to tag the current version in git from the build

Include our Gems
---------------------------
We will want to include our gems and any Ruby file in the `build_tools` folder:

```ruby
require "rake"
require "albacore"
require "fileutils"
require "grit"
require "configatron"
Dir.glob("./build_tools/*rb") do |include_file|
	require include_file
end
```

Preparing the Build
---------------------------
Next, the build script needs to define some common properties and clean up the solution from any previous build. To facilitate cleaning the build, I have created a Rake namespace called `:setup`. In this namespace I have three tasks for now; one to remove any build-created directories, one to re-create any directories needed by the build, and, finally, one to call that completes all setup tasks (there will be a few more shortly).

``` ruby
base_dir = File.dirname(__FILE__)
build_tools_dir = "#{base_dir}/build_tools"
build_dir = "#{base_dir}/build"
namespace :setup do

	desc "Cleans up and removes build related artifacts."
	task :clean do 
		FileUtils.rm_rf build_dir
	end
	
	desc "Initializes directories"
	task :init_directories => :clean do
		FileUtils.mkdir build_dir
	end
	
	desc "Prepares files/folders/etc. for a new build."
	task :init => [:init_directories] do
	end
end
```

Compiling the Project
---------------------------
For the compilation task, I used [Albacore](https://github.com/derickbailey/Albacore)&#8217;s `msbuild` task.

``` ruby
desc "Compiles the project."
msbuild :compile => "setup:init" do |msb|
	msb.command = "#{build_tools_dir}/msbuild/msbuild.exe"
	msb.properties = { :configuration => :Release} 
	msb.targets = [:Clean, :Build]
	msb.nologo
	msb.solution = "#{base_dir}/#{configatron.settings.target_solution_file}"
end
```

I have stored my target solution file in an external configuration file and used the [configatron](https://github.com/markbates/configatron) gem to make it available. In order to do this, I have created a `build_configuration.settings` file:

```ruby
configatron.configure_from_hash :settings => {
	:target_solution_file => "DomainFramework.sln",
	:title=> "Domain Framework",
	:description=> "Framework to facilitate domain-oriented development in .NET.",
	:company=> "We are Software Craftsmen",
	:product=> "Domain Framework",
	:copyright => "We are Software Craftsmen & Andrew Smith 2013"
}
```

Notice that this is simply a Ruby file with a different file extension. I then load this file in the beginning with my other common variable declarations at the top; giving me:

```ruby
load "#{base_dir}/build_configuration.settings"
```

The `msbuild` task uses the default location of the MSBuild executable. However, there is a chance the build machine does not have MSBuild in the correct location or even installed. In order to make the build self-contained, I have explicitly configured the task&#8217;s command location to use the MSBuild.exe located in my build_tools directory. The MSBuild executable can be copied from the following locations:

64-bit `C:\Windows\Microsoft.NET\Framework64\v4.0.30319\MSBuild.exe`

32-bit `C:\Windows\Microsoft.NET\Framework\v4.0.30319\MSBuild.exe`

Execute MSpec Specification Tests
-----------------------------------
Utilizing the specialized `mspec` [Albacore](https://github.com/derickbailey/Albacore) task makes this easy:

```ruby
desc "Executes all Mspec specifications."
mspec :test => :compile do |mspec|
	spec_dlls = Dir.glob("**/*.Specs.dll")
	if spec_dlls.length > 0 then
		mspec.command = "#{build_tools_dir}/mspec/mspec-clr4.exe"
		mspec.assemblies = spec_dlls
	end
end
```

I have the convention that all my Mspec assemblies will end with `.Specs.dll`, so the first thing it does is scan the project for any <abbr title="Dynamic Link Library">DLL</abbr>s that match that pattern. If it finds any, then it executes the mspec command. Notice that I am specifying the Mspec executable as being located in my `build_tools/mspec` folder. You will need to build Mspec from its [source](https://github.com/machine/machine.specifications) and add the built executable and assemblies to this folder.

Versioning
---------------------------
To manage the versioning, I created a Ruby class, `Version`:

```ruby
class Version
	def initialize(repo)
		@repo = repo
		@already_incremented = false
		@major_version = 0
		@minor_version = 1
		@commit_id = @repo.commits.first.id
		latest_tag = @repo.tags.select {|tag| /^v/ =~ tag.name}.sort_by! {|tag| tag.commit.authored_date }.last
		if !latest_tag.nil? then
			puts latest_tag.name
			version_parts = latest_tag.name.sub!(/^v/, "").split(".")
			@major_version = Integer(version_parts[0])
			@minor_version = Integer(version_parts[1])
		end
	end

	def increment_version(release_type)
		if !@already_incremented then
			@already_incremented = true
			if release_type == ReleaseType.major then
				increment_major
			elsif release_type == ReleaseType.minor
				increment_minor
			end
			return
		end
		throw :alreadyIncremented
	end

	def toString(with_commit_id = false)
		if with_commit_id then
			return "#{@major_version}.#{@minor_version}#{@commit_id}"
		end
		return "#{@major_version}.#{@minor_version}"
	end

	private
	def increment_major
		@minor_version = 0
		@major_version = @major_version + 1
	end

	def increment_minor
		@minor_version = @minor_version + 1	
	end
end
```

It accepts a [grit](https://github.com/mojombo/grit) repository object and defaults to version 0.1 (major.minor). From the repo object, it then pulls a sorted collection of tags and grabs the most recent tag matching the name `v*.*`; so for example `v0.1`. It then takes this tag and splits it into the major and minor version.

There is also a `toString` method for formatting the version in the format major.minor; with the optional setting to include the git commit sha at the end for major.minor.sha. Finally, we have an `increment_version` method that will increment the version based appropriately on the release type of major, minor, or ci. I did not want to use a magic string for the release type, so I also created another Ruby class to manage this; `ReleaseType`.

```ruby
class ReleaseType
	def initialize(type)
		@type = type
	end

	@@major = ReleaseType.new("major")
	@@minor = ReleaseType.new("minor")
	@@ci = ReleaseType.new("ci")

	def type
		return @type
	end

	def self.from_string(release_type)
		if release_type == "major" then
			return @@major
		elsif release_type == "minor"
			return @@minor
		elsif release_type == "ci"
			return @@ci
		end
		return @@ci
	end

	def self.major
		return @@major
	end

	def self.minor
		return @@minor
	end

	def self.ci
		return @@ci
	end
end
```

This class defines a string property for the type&#8217;s name and then three class properties for each of the release types; major, minor, and ci. It also has a class method to return a release type based on a passed string. With this, we need to add a few more common properties to our rakefile as seen below:

```ruby
#...

release_type_input = ENV["release_type"] || "ci"
release_type = ReleaseType.from_string(release_type_input)
repo = Grit::Repo.new(base_dir)
version = Version.new(repo)
```

Notice that I am using the [grit](https://github.com/mojombo/grit) Ruby gem and creating one stating that our project root is the git repository.

Updating the AssemblyInfo.cs with our Version
----------------------------------------------
We may have a mechanism in place for maintaining our version, but currently we are not actually using this version number anywhere. What we would like is for the build to automatically generate any required `AssemblyInfo.cs` with our information and version upon being built. I have added a few tasks in the `setup` namespace and modified our `init` task to utilize them:

```ruby
desc "Updates assembly info files."
task :update_assemblies do
	Dir.glob("*/Properties/").each {|folder|
		(assemblyinfo folder do |asm|
			asm.version = version.toString
			asm.company_name = configatron.settings.company_name
			asm.product_name = configatron.settings.product
			asm.title = configatron.settings.title
			asm.description = configatron.settings.description
			asm.copyright = configatron.settings.copyright
			asm.output_file = "#{folder}/AssemblyInfo.cs"
		end).invoke
	}
end

desc "Increments version"
task :increment_version do
	version.increment_version(release_type)
end

#...

desc "Prepares files/folders/etc. for a new build."
task :init => [:init_directories, :increment_version, :update_assemblies] do
end
```

Notice that an `AssemblyInfo.cs` file is created in every `Properties` folder two levels below the root; first level being the `csproj`/`vbproj` folder and the second being its contained `Properties` folder. I am using the `assemblyinfo` [Albacore](https://github.com/derickbailey/Albacore) task and my data is being set from my configuration file.

Build Output
---------------------------
Currently the `msbuild` task is building all our projects in place and not outputing the assemblies anywhere useful. We remedy this by creating another task responsible for moving all the built Release assemblies. These assemblies will be copied to a temporary folder to be processed further by the build script. We do not, however, want to copy any test releated assemblies or dependent assemblies. To faciliate this, I have added a `project_folders` property at the top of the rakefile that contains only project folders not affiliated with testing.

```ruby
rejectFolders = ["build", "release", "build_tools", "packages"]
project_folders = Dir.glob("#{base_dir}/*").reject{|folder| 
					rejectFolders.any? {|f|
						/.*#{f}/ =~ folder
					} ||
					/.*Specs.*/ =~ folder ||
					!File.directory?(folder)
				}

#...

desc "Copies project output to build folder."
task :build_output => "setup:init_directories" do
	project_folders.each do |folder|
	 	FileUtils.cp_r "#{folder}/bin/Release/.", build_dir
	end
end
```

I also create a new namespace, `release`, and add tasks for preparing for the build&#8217;s output.

```ruby
namespace :release do
	desc "Cleans for new release."
	task :clean do
		FileUtils.rm_rf release_dir
	end

	task :init => :clean do
		FileUtils.mkdir release_dir
	end
end
```

Finally, I add a task to the `release` namespace to copy all assemblies from the temporary build folder into a release folder. This will be used when no merging of assemblies is required:

```ruby
desc "Output the build&#8217;s release output."
task :output => [:test, :build_output, :init] do
	FileUtils.cp Dir.glob("#{build_dir}/*.dll"), release_dir
end
```

Merging Assemblies
---------------------------
In the case we want to merge all our assemblies into one to be output, we can use a tool called IL Merge. IL Merge is a tool which takes multiple .NET assemblies and combines them into one assembly <abbr title="Dynamic Link Library">DLL</abbr>. The ILMerge installer can be downloaded from [Microsoft](http://www.microsoft.com/en-us/download/details.aspx?id=17630). Once installed, you will need locate the ILMerge.exe file and add it to your `build_tools` directory.

I have added a task, `merge_and_output`, to the `release` namespace that utilizes the `ilmerge` [Albacore](https://github.com/derickbailey/Albacore) task.

```ruby
desc "Merge built assemblies."
ilmerge :merge_and_output => [:test, :build_output,:init] do |cfg|
	assemblies = Dir.glob("#{build_dir}/*.dll")
	cfg.command = "#{build_tools_dir}/ilmerge/ILMerge.exe"
	cfg.assemblies assemblies
	cfg.output = "#{release_dir}/#{configatron.settings.title}.Release.dll"
end
```

Because only non-test releated assemblies have been copied to the build output folder, we can simply take every assembly in the folder and merge them together. I am outputing the merged assembly to the release directory.

Tagging our Version in Git
---------------------------
The last task I need to create is one to tag a release in git. I created a `ReleaseManager` class to handle this functionality. It contains a single class level method that creates a tag based on the version and release type.

```ruby
class ReleaseManager
	def self.tag_release(version, release_type)
		exec "git tag -a \"v#{version.toString}\" -m \"Tagged for #{release_type.type}: v#{version.toString}\""
	end
end
```

I then use this class in my final rake task located in the release namespace. If the release type is not a minor or major release, an error is thrown.

```ruby
desc "Tags current version."
task :tag_release => :test do
	if release_type != ReleaseType.minor || release_type != ReleaseType.major then
		throw :releaseTypeNotSupported
	end
	ReleaseManager.tag_release(version, release_type)
end
```

Finally, I add my default rake task to simply build the project and release its output without merging or tagging.

```ruby
task :default => "release:output"
```

Conclusion
----------------------------
Using Ruby Rake we have successfully written a build automation script that can be used with most .NET projects; configurable by an external settings file. Of course, the full source can be pull via git from my [public repositories](https://gitlab.wearesoftwarecraftsmen.com/public). Feel free to leave your comments and questions. As always, remember that we all are software craftsmen!
---
layout: post
title: "Get Started with MSpec"
subtitle: "(Machine.Specifications)"
date: 2013-01-19 08:32
comments: true
categories: [TDD, BDD, mspec, unit testing]
---
This tutorial will help you get started using Machine.Specifications, otherwise known as MSpec,
for writing your <abbr title="Behavioral driven development">BDD</abbr> style unit tests, called specifications. In this tutorial we will go over the basic syntax of using MSpec, author some simple specifications, as well as setup ReSharper to run and output the results. <!--More-->

Get the Source
---------------------------
To facilitate setting up ReSharper to run MSpec specifications, we need to grab the latest source from github.

``` bash
git clone git://github.com/machine/machine.specifications.git mspec
```

Setting up ReSharper
----------------------------
Next, we need to build the source code. This can easily be done with the following command:

``` bash
cd mspec
build-release.cmd
```

This changes your current directory and then runs the file build-release.cmd; including running MSpec's own specifications and
then building the solution under release mode. The build's output files can be found in `mspec/Build/Release`. In this
directory, you will find files for ReSharper in the format of `InstallReSharperRunner.*.*.bat` where `*.*` is the
version of your ReSharper. Simply run the `.bat` file that corresponds to your ReSharper version. You ReSharper can
now run MSpec specifications! Now let's create a specification to see it in action.

Before we get Started
---------------------------
It is important to note where these specifications we are about to write are going to live. Do they go in a
class library project? Or is there a special project type; Test Project anyone? Well, when using MSpec,
your specifications are just special classes in a normal class library project. Typically,
I have a class library dedicated to specifications only. It is typically a **bad practice** to place the
tests for a feature in the class library containing that feature.

Although the class library containing your specifications is simply a class library project, it does, however,
require the MSpec DLLs. You can either use [nuget](http://nuget.org/) or you can grab the DLLs from the source we
just compiled.

Writing your First Specification
--------------------------------
Unlike traditional unit tests' style of Arrange-Act-Assert, specifications are typically Given-When-Then or
Establish context-Because of-It should). You will be declaring the *Subject* of your specification,
*Establish* the context in which the specification applies, *Because* an action occurs, *It* should do something.

With this said, you will want to pay particular attention to the **Subject**, **Establish**, **Because**, and **It** in the example below. The following code is a specification for concatentating two strings.

``` csharp
[Subject(typeof(StringUtilties))]
public class when_concatenating_two_strings
{
    static StringUtilities sut;
    static string input1;
    static string input2;
    static string actualValue;

    Establish that = () =>
    {
        sut = new StringUtilities();
        input1 = "Hello ";
        input2 = "World!"
    };

    Because of = () =>
        actualValue = sut.Concatenate(input1, input2);

    It should_concatenate_both_input_strings = () =>
        actualValue.ShouldEqual("Hello World!");
}
```

And this is the <abbr title="Subject under test">SUT</abbr> class:

``` csharp
public class StringUtilities
{
    public string Concatenate(string input1, string input2)
    {
        return input1 + input2;
    }
}
```

Running Your Specifications
---------------------------
<p class="clearfix">
<img class="img-polaroid pull-right" src="/images/posts/2013-01-19-getting-started-with-mspec-machine-dot-specifications/run-unit-tests-resharper-right-click-menu_resized.png" /> Having setup ReSharper with MSpec, the easiest way is to right-click on the specifications project and click "Run Unit Tests" as seen in the screenshot here:
</p>

<p class="clearfix">
Running your unit tests will open the Unit Tests Session window. From here you can run all or any subset of your unit tests. Note that you may add tests from other files to the current testing session. This allows you to configure your session to only run the tests you want; you are not boxed into an all or nothing testing scenario.
<img class="im-polaroid pull-left" src="/images/posts/2013-01-19-getting-started-with-mspec-machine-dot-specifications/unit-test-sessions.png" />
</p>

<p class="clearfix">
ReSharper has much more to offer for unit testing than just this. Checking out the ReSharper menu item reveals quite a bit of additional functionality.
<img class="im-polaroid pull-right" src="/images/posts/2013-01-19-getting-started-with-mspec-machine-dot-specifications/resharper-unit-tests-menu_resized.png" />
</p>

Wrapping it Up
----------------------
Hopefully, you now have a basic understanding of getting your MSpec specifications up and running. Next time, I will go over creating ReSharper file and live templates; helping you write specifications even faster and more effectively. As always, remember that we are all software craftsmen and we should always strive for improvement; both professionally and personally. Thanks for stopping by.
---
layout: post
title: "Mastering the Tools of your Craft"
date: 2013-01-14 11:01
comments: true
categories: automation
---
With a site and blog titled "We are Software Craftsmen," I feel it is fitting for the first article I write to be about mastering the tools of the craft. What I mean, specifically, is not simply masteringing the tools you work with on a daily basis, rather leveraging those tools to automate as much as your workflow as possible. This ultimately leads to a potentially significant boost in your producitivy and ability to produce high quality software. <!--more-->

Get Cozy with the Command Line
--------------------------------------------
{% pullquote %}
I will admit, when I first started using PowerShell and the command line in general I was pretty skeptical. I like having a nice <abbr title="Graphic User Interface">GUI</abbr> as much as the next person. However, after I became more and more comfortable with using the command line, I quickly realized how much faster it was to do things. Although I can type much faster than I can click buttons, the increase in speed did not come from this. Rather, {"the most significant time saver turned out to be the automation of common tasks that PowerShell afforded me"}. So I guess this is the first message from experience:
{% endpullquote %}

{% blockquote %}
Master PowerShell and take charge of the command line.
{% endblockquote %}

Automate Where Ever Possible
----------------------------
Automate, automate, automate; spending a little up front will yield exponential savings over time. What can I automate or not sure what to automate? Well, the simple rule of thumb is if you find yourself performing a task over and over again, then chances are you can automate it. So let's take a simple example.

When I want to begin working on a project, I typically do the following:

1. Open PowerShell
2. Potentially list the directories in my repository directory
3. Change the directory to the project I want to work on
4. Open the project file in tool of choice (Solution file, etc.).

{% pullquote %}
Does not seem like much and probably takes less than 20-30 seconds. However, how many times will I perform these steps over the course of the few years? Turns out {"I could be spending 30-40 hours on just opening projects"} over the next few years; yikes!
{% endpullquote %}

{% pullquote left %}
So what have I done to remedy this? I spent less than an hour writing a PowerShell script that lists all my projects in my repository folder and lets me quickly choose one by index. Seems trivial right? I mean, how much time is that really saving? Well, turns out that {"it saves me almost 18 hours"} or so. Something so simple and took less than a hour to do, has made me more productive.
{% endpullquote %}

This same concept, and really mentality, can be applied to all aspects of your development workflow. As just another example, I have scripts that, with one line, can create a new project; complete with git initialization, settings, downloading default packages for various tools and project types.

{% blockquote %}
Automate your workflow; where ever you are able.
{% endblockquote %}

Git your Code under Control
---------------------------
{% pullquote %}
Git is a powerful distributed source control system; allowing for push and pulling from any number of remote Git repositories. Whether you decide to use a service like [Github](https://github.com/) or [Bitbucket](https://bitbucket.org/) or perhaps have local repositories only, you should be using some kind of source code control. Am I talking about using <abbr title="Source control management">SCM</abbr> where you work? Yes. {"Am I talk about using SCM for your own personal projects? Yes!"}
{% endpullquote %}

{% pullquote left %}
So why should you use something like Git for even your own small, pet projects? Well, for one, it gives you an ongoing learning opportunity to hone your skills with not only using Git in particular, but knowing when to branch and how to merge. {"If you already have a mastery of Git, then you're probably already using it for your personal projects."}
{% endpullquote %}

{% blockquote %}
Use source control for all your projects; professional and personal alike.
{% endblockquote %}

All Together - Script your Workbench Setup
------------------------------------------
Something that I have as an ongoing work in progress, is the development of a set of scripts to automate setting up my workbench environment and customizing it to my liking. What do I mean by this? If I have a new development virtual machine, with all my software installed, I can run a collection of commands in PowerShell that will setup my workbench environment. Just a few of the things it will do are:

* Configure git (my .gitconfig file) with my name, email address, generate my SSH key, etc.
* Install my personalize settings in Visual Studio for the color scheme ([solarized](http://ethanschoonover.com/solarized) <abbr title="For the win">FTW</abbr>), my custom keyboard shortcuts, etc.
* Install my ReSharper settings including all my file and live templates

I keep all this development in a Git repository and am constantly adding to and improving it; which brings us to our last item:

{% blockquote Andrew Smith, http://WeAreSoftwareCraftsmen.com %}
Never settle; always strive for improvement.
{% endblockquote %}

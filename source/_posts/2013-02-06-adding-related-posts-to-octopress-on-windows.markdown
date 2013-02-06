---
layout: post
title: "Adding Related Posts to Octopress on Windows"
date: 2013-02-06 11:34
comments: true
categories: ["octopress", "ruby"]
---
Although Jekyll already has the "related posts" feature baked in, utilizing rb-gsl can drastically speed up the site generation time by a magnitude of 10 times. However, installing the rb-gsl gem requires you to compile gsl from its source; which can be a little tricky on Windows. Throw in only a handful of helpful articles and you may find yourself frustrated trying to accomplish this. In this article, I detail the steps to get related posts up, running, and generating on your Windows machine via rb-gsl and gsl. <!-- More-->

Create a Template
-------------------------------
First, create a template for the related posts aside. I have created mine as follows `source/_includes/custom/asides/related_posts.html`. Below is my markup:
{% raw %}
```html
<section>
    <h1>Related Posts</h1>
    <ul class="related_posts unstyled">
      {% for post in site.related_posts limit:5 %}
        <li class="post">
                    <a href="{{ root_url }}{{ post.url }}">{{ post.title }}</a>
                </li>
      {% endfor" %}
    </ul>
</section>
```
{% endraw %}

I am limiting a maximum of 5 related posts to be shown at once. I then included this aside in my post layout. Previewing the site populates this with the most recent posts. For a better list of related posts, we need to enable lsi in Jekyll.

Jekyll and Octopress Configuration
----------------------------------
Open the `_config_yml` file and add the following line anywhere in the file:

```ruby
lsi: true
```

This is all that is necessary. However, you may find that generating your blog now takes a very long time. This is because it is performing statistical analysis of your posts to determine which ones relate the best. To remedy this, we need to install gsl.

Get the Ruby DevKit
--------------------------------
1. Download and unzip the [Ruby DevKit](https://github.com/downloads/oneclick/rubyinstaller/DevKit-tdm-32-4.5.2-20111229-1559-sfx.exe) to `C:\Ruby193DevKit`
2. Open the command and use the following commands:

```bash
cd C:\Ruby193DevKit
ruby dk.rb init
```

3. Open the newly created `config.yml` and ensure your Ruby is listed in the file.
4. Now issue the following commands:

```bash
ruby dk.rb install
```

Installing GSL
---------------------------------
1. Download [GSL 1.15](http://ftpmirror.gnu.org/gsl/gsl-1.15.tar.gz)
2. Using something like 7zip, unzip/untar the download to `C:\gsl-1.15`
3. Open the following file: `C:\Ruby193DevKit\msys.bat`. This will open up a special command window.
4. Issue the following commands (may take several minutes to complete):

```bash
cd /C/gsl-1.15
./configure
make
make install
```

Installing rb-gsl
----------------------------------
1. Download the [rb-gsl source](https://github.com/romanbsd/rb-gsl/archive/master.zip) and unzip it to `C:\rb-gsl`
2. Next, using the same `msys.bat` command window, `cd` into the root of the rb-gsl directory and issue the following commands (as root):

```bash
ruby setup.rb config
ruby setup.rb setup
ruby setup.rb install
```

Conclusion and a Note on Usage
-----------------------------------
You now have successfully installed the gsl library, rb-gsl gem and enabled the related posts functionality in Jekyll. It is worth noting that in order to generate your site with rb-gsl you need to use the `C:\Ruby193DevKit\msys.bat` command prompt. I have not had success doing so by simply using PowerShell.
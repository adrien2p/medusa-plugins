<p align="center">
  <img src="https://github.com/adrien2p/medusa-plugins/blob/assets/assets/medusa-plugins-logo.png?raw=true" alt="Medusa-plugins logo" width="500" height="auto" />
</p>
<h1 align="center">medusa-plugins</h1>

<p align="center">
<a href="https://github.com/adrien2p/medusa-extender/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/adrien2p/medusa-extender.svg" height="20"/></a>
<a href="https://github.com/adrien2p/awesome-medusajs"><img alt="Awesome medusajs" src="https://awesome.re/badge.svg" height="20"/></a>
<a href="https://discord.gg/xpCwq3Kfn8"><img alt="Discord" src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" height="20"/></a>
<a href="https://github.com/adrien2p/medusa-plugins/commits/main"><img alt="Activity" src="https://img.shields.io/github/commit-activity/m/adrien2p/medusa-plugins?style=flat" height="20"/></a>
<a href="https://github.com/adrien2p/medusa-plugins/issues"><img alt="Issues" src="https://img.shields.io/github/issues/adrien2p/medusa-extender?style=flat" height="20"/></a>
<a href="https://github.com/adrien2p/medusa-plugins/blob/main/LICENSE"><img alt="Licence" src="https://img.shields.io/github/license/adrien2p/medusa-plugins?style=flat" height="20"/></a>
<a href="https://github.com/adrien2p/medusa-plugins/blob/main/CONTRIBUTING.md"><img alt="Contributing" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" height="20"/></a>
<a href="https://github.com/adrien2p/medusa-plugins/actions/workflows/action.yml"><img alt="Test pipeline status" src="https://github.com/adrien2p/medusa-plugins/actions/workflows/action.yml/badge.svg" height="20"/></a>
<a href="https://github.com/adrien2p/medusa-plugins/actions/workflows/codeql-analysis.yml"><img alt="CodeQL security analysis status" src="https://github.com/adrien2p/medusa-plugins/actions/workflows/codeql-analysis.yml/badge.svg" height="20"/></a>
	</p>

<p align="center">
  <b>A collection of awesome plugins for medusa and medusa-extender :rocket:</b></br>
</p>

<br />


<p align="center">
    <a href="https://www.buymeacoffee.com/adriendeperetti" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
</p>


[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/cloudy.png)](#table-of-contents)

## Table of Contents

* [Introduction](#introduction)
* [Plugins](#plugins)
* [Discussions](#discussions)
* [Like my work? :heartbeat:](#like-my-work-heartbeat)
* [Contribute](#contribute)

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/cloudy.png)](#introduction)

# Introduction

Hey there, you will find here a collection of awesome plugins for both `medusa` and `medusa-extender`.
I do that repository in order to centralise the different plugin I am working on and to 
make it easier for you to find them :rocket:

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/cloudy.png)](#plugins)

# Plugins

| Name                      | Target        | Badges                                       |
|---------------------------|---------------|----------------------------------------------|
| `payment-paytr`           | `medusa`      |                                              |

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/cloudy.png)](#discussions)

# Discussions

If you are interesting to participate in any discussions you can follow that [links](https://github.com/adrien2p/medusa-extender/discussions)

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/cloudy.png)](#like-my-work-heartbeat)

# Like my work? :heartbeat:

This project needs a :star: from you. Don't forget to leave a star :star:.
If you found the package helpful consider supporting me with a coffee

<a href="https://www.buymeacoffee.com/adriendeperetti" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

[![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/cloudy.png)](#contribute)

# Contribute

Contributions are welcome! You can look at the contribution [guidelines](./CONTRIBUTING.md)

# Development

## Plugin

Go to the plugin package directory and Build your local plugin

```bash
npm run build
npm pack
```

Then copy the tgz file newly creating by the `pack` command into your project.

## Target project

In your target project past the tgz file previously copied.
then update your `package.json`

```bash
"my-package": "file:my-package-1.0.0.tgz"
```

now run `npm i` and run your project
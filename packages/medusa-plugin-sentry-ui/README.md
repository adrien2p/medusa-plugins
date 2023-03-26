<p align="center">
  <img src="https://github.com/adrien2p/medusa-plugins/blob/assets/assets/medusa-plugin-sentry-ui-logo.png?raw=true" alt="Medusa-plugins logo" width="500" height="auto" />
</p>

<h1 align="center">medusa-plugin-sentry-ui</h1>

<p align="center">
	<a href="https://www.npmjs.com/package/medusa-plugin-sentry-ui"><img alt="NPM Version" src="https://img.shields.io/npm/v/medusa-plugin-sentry-ui.svg" height="20"/></a>
	<a href="https://github.com/adrien2p/medusa-plugins/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/adrien2p/medusa-plugins.svg" height="20"/></a>
	<a href="https://github.com/adrien2p/awesome-medusajs"><img alt="Awesome medusajs" src="https://awesome.re/badge.svg" height="20"/></a>
	<a href="https://twitter.com/intent/tweet?text=Check%20this%20out!%20The%20new%20medusa%sentry%20plugin&url=https://github.com/adrien2p/medusa-plugins/tree/main/packages/medusa-plugin-sentry-ui"><img alt="Twitter" src="https://badgen.net/badge/icon/twitter?icon=twitter&label=Share%20it%20on" height="20"/></a>
	<a href="https://discord.gg/xpCwq3Kfn8"><img alt="Discord" src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" height="20"/></a>
	<a href="https://github.com/adrien2p/medusa-plugins/commits/main"><img alt="Activity" src="https://img.shields.io/github/commit-activity/m/adrien2p/medusa-plugins?style=flat" height="20"/></a>
	<a href="https://github.com/adrien2p/medusa-plugins/issues"><img alt="Issues" src="https://img.shields.io/github/issues/adrien2p/medusa-plugins?style=flat" height="20"/></a>
    <a href="https://github.com/sponsors/adrien2p"><img alt="sponsor" src="https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86" height="20"/></a>
</p>

<p align="center">
  <img src="https://github.com/adrien2p/medusa-plugins/blob/assets/assets/medusa-plugin-sentry-ui.gif?raw=true" alt="Medusa-plugins logo" width="500" height="auto" />
</p>

## Description

This package provides a set of components to have a Sentry dashboard right within your admin interface, allowing you to get an overview of what is happening without needing to leave your admin panel.

It also provides JavaScript error and performance monitoring, helping you resolve JavaScript errors with maximum efficiency rather than maximum effort. You can obtain actionable insights to resolve JavaScript performance issues and track, debug, and fix JavaScript errors across different platforms.

## Getting started

> ### Requirements
> To use this library, the `medusa-plugin-sentry` needs to be installed on your server
> as it is responsible for providing the necessary data.

First of all, you need to install the plugin as follows: `yarn add medusa-plugin-sentry-ui`

To set up the Sentry dashboard in your Medusa admin interface, follow these steps:

Open the `src/pages/a.js` file and add the following component above the `Routes`:
```javascript
import { medusaUrl } from "../services/config"
import { Sentry } from "medusa-plugin-sentry-ui"

const SentryRoute = () => {
  const location = useLocation()
  const organisation = "YOUR_ORGA_ON_SENTRY"
  const project = "YOUR_PROJECt_ON_SENTRY"
  
  return (
    <Router>
        <Sentry path="/" baseUrl={medusaUrl} organisation={organisation} project={project} location={location} />
    </Router>
  )
}
```
> **Note**
> Be sure to replace `YOUR_ORGA_ON_SENTRY` and `YOUR_PROJECT_ON_SENTRY` with the corresponding values for your Sentry account and project


Next, add the following code to the `Routes` component, below the other routes:
```javascript
<SentryRoute path="sentry/*"/>
```

Finally, to add a link to the Sentry dashboard in the sidebar menu, go to `src/components/organisms/sidebar/index.tsx` and add the following menu item:
```javascript
<SidebarMenuItem
    pageLink={"/a/sentry"}
    icon={<ClockIcon size={ICON_SIZE} />}
    triggerHandler={triggerHandler}
    text={"Sentry"}
/>
```

You should now be able to start your admin and go to your page to see your sentry dashboard :rocket:

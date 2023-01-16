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

Thie spackage provides a set of component to have a sentry dashboard right into your admin
and be able to get an overview of what is happening without having to leave your admin.

JavaScript Error and Performance Monitoring
Resolve JavaScript errors with max efficiency, not max effort. Get actionable insights to resolve JavaScript performance issues with the ability to track, debug, and resolve JavaScript errors across platforms.

## Getting started

> ### Requirements
> Your server need to have installed `medusa-plugin-sentry` before being able to use that library
> as the data are comsumed from that plugin.

First of all, you need to install the plugin as follow `yarn add medusa-plugnin-sentry-ui`

For the simple uasge you can open the file `src/pages/a.js` and add the following component above the `Routes` component
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

The in the `Routes` component you can add the following content just bellow the other routes
```javascript
<SentryRoute path="sentry/*"/>
```

Finally, to add an access to your page, you can go to `src/components/organisms/sidebar/index.tsx`
and add a new item in the component just like the following one
```javascript
<SidebarMenuItem
    pageLink={"/a/sentry"}
    icon={<ClockIcon size={ICON_SIZE} />}
    triggerHandler={triggerHandler}
    text={"Sentry"}
/>
```

You should now be able to start your admin and go to your page to see your sentry dashboard :rocket:
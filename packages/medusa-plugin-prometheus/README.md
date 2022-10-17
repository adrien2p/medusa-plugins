<p align="center">
  <img src="https://github.com/adrien2p/medusa-plugins/blob/assets/assets/**medusa-plugin-prometheus**.png?raw=true" alt="Medusa-plugins logo" width="500" height="auto" />
</p>

<h1 align="center">medusa-plugin-prometheus</h1>

<p align="center">
	<a href="https://www.npmjs.com/package/medusa-plugin-prometheus"><img alt="NPM Version" src="https://img.shields.io/npm/v/medusa-plugin-prometheus.svg" height="20"/></a>
	<a href="https://github.com/adrien2p/medusa-plugins/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/adrien2p/medusa-plugins.svg" height="20"/></a>
	<a href="https://github.com/adrien2p/awesome-medusajs"><img alt="Awesome medusajs" src="https://awesome.re/badge.svg" height="20"/></a>
	<a href="https://twitter.com/intent/tweet?text=Check%20this%20out!%20The%20new%20medusa%sentry%20plugin&url=https://github.com/adrien2p/medusa-plugins/tree/main/packages/medusa-plugin-prometheus"><img alt="Twitter" src="https://badgen.net/badge/icon/twitter?icon=twitter&label=Share%20it%20on" height="20"/></a>
	<a href="https://discord.gg/xpCwq3Kfn8"><img alt="Discord" src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" height="20"/></a>
	<a href="https://github.com/adrien2p/medusa-plugins/commits/main"><img alt="Activity" src="https://img.shields.io/github/commit-activity/m/adrien2p/medusa-plugins?style=flat" height="20"/></a>
	<a href="https://github.com/adrien2p/medusa-plugins/issues"><img alt="Issues" src="https://img.shields.io/github/issues/adrien2p/medusa-plugins?style=flat" height="20"/></a>
</p>

## Description

JavaScript Error and Performance Monitoring
Resolve JavaScript errors with max efficiency, not max effort. Get actionable insights to resolve JavaScript performance issues with the ability to track, debug, and resolve JavaScript errors across platforms.

## Getting started

First of all, you need to install the plugin as follow `yarn add @medusa-plugins/medusa-plugnig-prometheus`

Then, go to your `medusa-config.js` file and in the plugins collection property add the following at the beginning to be registered first
```javascript
{
  resolve: `medusa-plugin-prometheus`,
  options: {
    uriPath: "/monitoring"
  },
},
```

## Configuration

You can see above some configuration for the plugin. To be able to know all the options available
you can have a look at
- [swagger-stats](https://swaggerstats.io/guide/conf.html#options)

And here are the plugin configuration types
```typescript
export type SwaggerStats = {
    name?: string;
    version?: string;
    hostname?: string;
    ip?: string;
    timelineBucketDuration?: number;
    swaggerSpec?: string | OpenAPI.Document;
    uriPath: string;
    durationBuckets?: number[];
    requestSizeBuckets?: number[];
    responseSizeBuckets?: number[];
    apdexThreshold?: number;
    onResponseFinish?: (req: Request, res: Response, next: NextFunction) => void | Promise<void>;
    authentication?: boolean;
    sessionMaxAge?: number;
    elasticsearch?: string;
    onAuthenticate?: (req: Request, username: string, password: string) => boolean | Promise<boolean>;
};

```
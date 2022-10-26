<p align="center">
  <img src="https://github.com/adrien2p/medusa-plugins/blob/assets/assets/medusa-plugin-prometheus.png?raw=true" alt="Medusa-plugins logo" width="500" height="auto" />
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
    <a href="https://github.com/adrien2p/medusa-plugins/actions/workflows/medusa-plugin-prometheus.yml/"><img alt="Tests pipeline" src="https://github.com/adrien2p/medusa-plugins/actions/workflows/medusa-plugin-prometheus.yml/badge.svg" height="20"/></a>
</p>

## Description

swagger-stats traces REST API requests and responses in Node.js Microservices, and collects statistics per API Operation. swagger-stats detects API operations based on express routes. You may also provide Swagger (Open API) specification, and swagger-stats will match API requests with API Operations defined in swagger specification.

The data can be served to **kibana through ElasticSearch** or can also be consumed by **Grafana**

## Getting started

First of all, you need to install the plugin as follow `yarn add @medusa-plugins/medusa-plugnig-prometheus`

Then, go to your `medusa-config.js` file and in the plugins collection property add the following at the beginning to be registered first
```javascript
{
    resolve: `medusa-plugin-prometheus`,
    options: {
        uriPath: "/monitoring",
        authentication: true,
        onAuthenticate: (req, username, password) => {
          return username === process.env.PROM_USER_NAME && password = process.env.PROM_USER_PASS 
        },
    },
},
```

### Output Dashboard

<p align="left">
  <img src="https://github.com/adrien2p/medusa-plugins/blob/assets/assets/medusa-plugin-prom-dashboard-1.png?raw=true" alt="Medusa-plugin-prometheus-dashboard-1 logo" width="300" height="auto" />
<img src="https://github.com/adrien2p/medusa-plugins/blob/assets/assets/medusa-plugin-prom-dashboard-2.png?raw=true" alt="Medusa-plugin-prometheus-dashboard-2 logo" width="300" height="auto" style="margin-left: 1rem" />
<img src="https://github.com/adrien2p/medusa-plugins/blob/assets/assets/medusa-plugin-prom-dashboard-3.png?raw=true" alt="Medusa-plugin-prometheus-dashboard-3 logo" width="300" height="auto" style="margin-left: 1rem" />
</p>

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

## Grafana

Get started quickly with that guide [here](https://prometheus.io/docs/visualization/grafana/)
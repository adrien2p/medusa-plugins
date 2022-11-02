<p align="center">
  <img src="https://github.com/adrien2p/medusa-plugins/blob/assets/assets/medusa-plugin-sentry-logo.png?raw=true" alt="Medusa-plugins logo" width="500" height="auto" />
</p>

<h1 align="center">medusa-plugin-sentry</h1>

<p align="center">
	<a href="https://www.npmjs.com/package/medusa-plugin-sentry"><img alt="NPM Version" src="https://img.shields.io/npm/v/medusa-plugin-sentry.svg" height="20"/></a>
	<a href="https://github.com/adrien2p/medusa-plugins/graphs/contributors"><img alt="Contributors" src="https://img.shields.io/github/contributors/adrien2p/medusa-plugins.svg" height="20"/></a>
	<a href="https://github.com/adrien2p/awesome-medusajs"><img alt="Awesome medusajs" src="https://awesome.re/badge.svg" height="20"/></a>
	<a href="https://twitter.com/intent/tweet?text=Check%20this%20out!%20The%20new%20medusa%sentry%20plugin&url=https://github.com/adrien2p/medusa-plugins/tree/main/packages/medusa-plugin-sentry"><img alt="Twitter" src="https://badgen.net/badge/icon/twitter?icon=twitter&label=Share%20it%20on" height="20"/></a>
	<a href="https://discord.gg/xpCwq3Kfn8"><img alt="Discord" src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" height="20"/></a>
	<a href="https://github.com/adrien2p/medusa-plugins/commits/main"><img alt="Activity" src="https://img.shields.io/github/commit-activity/m/adrien2p/medusa-plugins?style=flat" height="20"/></a>
	<a href="https://github.com/adrien2p/medusa-plugins/issues"><img alt="Issues" src="https://img.shields.io/github/issues/adrien2p/medusa-plugins?style=flat" height="20"/></a>
    <a href="https://github.com/adrien2p/medusa-plugins/actions/workflows/medusa-plugin-sentry.yml/"><img alt="Tests pipeline" src="https://github.com/adrien2p/medusa-plugins/actions/workflows/medusa-plugin-sentry.yml/badge.svg" height="20"/></a>
</p>

## Description

JavaScript Error and Performance Monitoring
Resolve JavaScript errors with max efficiency, not max effort. Get actionable insights to resolve JavaScript performance issues with the ability to track, debug, and resolve JavaScript errors across platforms.

## Getting started

First of all, you need to install the plugin as follow `yarn add medusa-plugin-sentry`

Then, go to your `medusa-config.js` file and in the plugins collection property add the following at the beginning to be registered first
```javascript
{
  resolve: `medusa-plugin-sentry`,
  options: {
    dsn: "__YOUR_DSN__",
    apiToken: "__YOUR_API_TOKEN__",
    integrations: (router, Sentry, Tracing) => {
      return [
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ router }),
      ];
    },
    tracesSampleRate: 1.0,
    webHookOptions: {
      path: "/sentry/webhook",
      secret: "__YOUR_SECRET__",
      emitOnIssue: true,
      emitOnError: false,
      emitOnComment: true,
      emitOnEventOrMetricAlert: true,
      emitOnInstallOrDeleted: false,
    }
  },
},
```

> The `webHookOptions.path` is always attached on the `/admin` domain. Which means that if you specify something like `/sentry` the result path will be `/admin/sentry`

## Configuration

You can see above some configuration for the plugin. To be able to know all the options available
you can have a look at
- [NodeOptions](https://github.com/getsentry/sentry-javascript/blob/7304215d875decf0bf555cab82aa90fc1341b27e/packages/node/src/types.ts#L30)

And here are the plugin configuration types
```typescript
export type SentryWebHookOptions = {
    path: string;
    secret: string;
    emitOnIssue?: boolean | ((container: unknown, data: SentryWebHookData) => Promise<void>);
    emitOnError?: boolean | ((container: unknown, data: SentryWebHookData) => Promise<void>);
    emitOnComment?: boolean | ((container: unknown, data: SentryWebHookData) => Promise<void>);
    emitOnEventOrMetricAlert?: boolean | ((container: unknown, data: SentryWebHookData) => Promise<void>);
    emitOnInstallOrDeleted?: boolean | ((container: unknown, data: SentryWebHookData) => Promise<void>);
};

export type SentryOptions = Omit<NodeOptions, 'integrations'> & {
    integrations: Integration[] | ((router: Router, sentry: typeof Sentry, tracing: typeof Tracing) => Integration[]);
    requestHandlerOptions?: RequestHandlerOptions;
    enableRequestHandler?: boolean;
    enableTracing?: boolean;
    webHookOptions?: SentryWebHookOptions,
};
```

## Web hooks

> Learn more about sentry integration [here](https://docs.sentry.io/product/integrations/integration-platform/)

With this plugin, you can register the path and options to the web hook you want to make available for sentry
using the `webHookOptions` from the [config](#getting-started).

To activate the web hook you have to provide the appropriate configurations.

Once sentry send an event to the web hook, each type of resource will emit 
his own event that you can subscribe to using the medusa [subscribers](https://docs.medusajs.com/advanced/backend/subscribers/overview/).

Here is the list of the event that can be emitted

```typescript
export enum SentryWebHookEvent {
    SENTRY_RECEIVED_ISSUE = 'SentryReceivedIssue',
    SENTRY_RECEIVED_ERROR = 'SentryReceivedError',
    SENTRY_RECEIVED_COMMENT = 'SentryReceivedComment',
    SENTRY_RECEIVED_EVENT_OR_METRIC_ALERT = 'SentryReceivedEventOrMetricAlert',
    SENTRY_RECEIVED_INSTALL_OR_DELETED = 'SentryReceivedInstallOrDeleted',
}
```

It is also possible to specify a function for each of the `emitOn*` options which take the request as the parameter. From that method you can
resolve any of your services and call it to handle the event. In that case, the even bus will not fire the corresponding event.

## API

The sentry plugins will provide you some authenticated end points if you want to get some data about your transactions and events related to the transactions.

### /admin/sentry-transactions

This end point allow you to retrieve all your transactions for a given period, here are the allowed query parameters

```markdown
- organisation    - The organisation to fetch the transactions from
- project         - The project to fetch the transactions from
- query           - Equation to filter the result (https://docs.sentry.io/product/sentry-basics/search/)
- statsPeriod     - The period from when to fetch the transactions (default: 24h) 
- perPage         - The number of transaction per page
- cursor          - The cursor to send to fetch the transactions for a given page
```

The output of that query looks like the following

```json
{
    "data": [
        {
            "transaction": "POST /admin/customers/:id",
            "id": "***",
            "project.name": "node-express"
        },
        // ... 19 other items
    ],
    "meta": {
        "fields": {
            "transaction": "string",
            "id": "string",
            "project.name": "string"
        },
        "units": {
            "transaction": null,
            "id": null,
            "project.name": null
        },
        "isMetricsData": false,
        "tips": {
            "query": null,
            "columns": null
        }
    },
    "next_cursor": "0:20:0",
    "prev_cursor": "0:0:0"
}
```

### /admin/sentry-transaction-events

This end point allow you to retrieve all your transaction events for a given period, here are the allowed query parameters

```markdown
- transaction     - The transaction for which the events must be retrieved (e.g "GET /admin/users")
- organisation    - The organisation to fetch the transactions from
- project         - The project to fetch the transactions from
- query           - Equation to filter the result (https://docs.sentry.io/product/sentry-basics/search/)
- statsPeriod     - The period from when to fetch the transactions (default: 24h) 
- perPage         - The number of transaction per page
- cursor          - The cursor to send to fetch the transactions for a given page
```

The output of that query looks like the following

```json
{
    "data": [
        {
            "spans.db": 46.443939,
            "timestamp": "2022-10-11T14:00:11+00:00",
            "id": "***",
            "transaction.duration": 115,
            "spans.http": null,
            "project.name": "node-express"
        },
        {
            "spans.db": 5.561113,
            "timestamp": "2022-10-11T13:30:43+00:00",
            "id": "***",
            "transaction.duration": 18,
            "spans.http": null,
            "project.name": "node-express"
        }
    ],
    "meta": {
        "fields": {
            "spans.db": "duration",
            "timestamp": "date",
            "id": "string",
            "transaction.duration": "duration",
            "spans.http": "duration",
            "project.name": "string"
        },
        "units": {
            "spans.db": "millisecond",
            "timestamp": null,
            "id": null,
            "transaction.duration": "millisecond",
            "spans.http": "millisecond",
            "project.name": null
        },
        "isMetricsData": false,
        "tips": {
            "query": null,
            "columns": null
        }
    },
    "prev_cursor": "0:0:0",
    "next_cursor": "0:100:0"
}
```

### /admin/sentry-transactions-stats

This end point allow you to retrieve all your transaction events for a given period, here are the allowed query parameters

```markdown
- transaction     - The transaction for which the events must be retrieved (e.g "GET /admin/users")
- organisation    - The organisation to fetch the transactions from
- project         - The project to fetch the transactions from
- statsPeriod     - The period from when to fetch the transactions (default: 24h) 
```

The result will be an aggregation of the data for the APDEX/TPM/FAILURE_RATE

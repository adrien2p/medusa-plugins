import express, { Router } from 'express';
import cors from 'cors';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import authenticate from '@medusajs/medusa/dist/api/middlewares/authenticate';
import wrapHandler from '@medusajs/medusa/dist/api/middlewares/await-middleware';
import { getConfigFile } from 'medusa-core-utils';

import { SentryOptions, SentryWebHookOptions } from '../types';
import sentryTransactionsHandler from './handlers/sentry-transaction';
import sentryTransactionEventsHandler from './handlers/sentry-transaction-events';
import sentryTransactionsStatsHandler from './handlers/sentry-transactions-stats';
import sentryWebHookHandler from './handlers/sentry-web-hook';

export default function (rootDirectory, pluginOptions: SentryOptions): Router {
	const router = Router();

	const {
		integrations,
		requestHandlerOptions = {},
		enableTracing = true,
		enableRequestHandler = true,
		webHookOptions,
		apiToken,
		...options
	} = pluginOptions;

	Sentry.init({
		...options,
		integrations: Array.isArray(integrations) ? integrations : integrations(router, Sentry, Tracing),
	});

	if (enableRequestHandler) {
		// RequestHandler creates a separate execution context using domains, so that every
		// transaction/span/breadcrumb is attached to its own Hub instance
		router.use(Sentry.Handlers.requestHandler(requestHandlerOptions));
	}

	if (enableTracing) {
		// TracingHandler creates a trace for every incoming request
		router.use(Sentry.Handlers.tracingHandler());
	}

	attachSentryErrorHandler();

	if (webHookOptions) {
		attachSentryWebHook(router, webHookOptions);
	}

	if (apiToken) {
		attachAdminEndPoints(router, rootDirectory, pluginOptions);
	}

	return router;
}

/**
 * Attach the sentry error handler in the medusa core
 */
function attachSentryErrorHandler() {
	/* eslint-disable @typescript-eslint/no-var-requires */
	const medusaErrorHandler = require('@medusajs/medusa/dist/api/middlewares/error-handler');
	const originalMedusaErrorHandler = medusaErrorHandler.default;
	medusaErrorHandler.default = () => {
		return (err, req, res, next) => {
			Sentry.Handlers.errorHandler({
				shouldHandleError: () => true,
			})(err, req, res, () => void 0);
			originalMedusaErrorHandler()(err, req, res, next);
		};
	};
}

/**
 * Attach sentry web hook
 * @param router
 * @param webHookOptions
 */
function attachSentryWebHook(router: Router, webHookOptions: SentryWebHookOptions): void {
	router.post(
		'/admin' + webHookOptions.path,
		express.json(),
		express.urlencoded({ extended: true }),
		sentryWebHookHandler(webHookOptions)
	);
}

/**
 * Attach specific sentry end point to fetch data under the admin domain
 * @param router
 * @param rootDirectory
 * @param pluginOptions
 */
function attachAdminEndPoints(router, rootDirectory, pluginOptions) {
	const { apiToken } = pluginOptions;
	const { configModule } = getConfigFile(rootDirectory, 'medusa-config') as {
		configModule: { projectConfig: { admin_cors: string } };
	};
	const { projectConfig } = configModule;

	const corsOptions = {
		origin: projectConfig.admin_cors.split(','),
		credentials: true,
	};

	router.use('/admin/sentry-transactions', cors(corsOptions));
	router.get('/admin/sentry-transactions', authenticate(), wrapHandler(sentryTransactionsHandler(apiToken)));

	router.use('/admin/sentry-transactions-stats', cors(corsOptions));
	router.get(
		'/admin/sentry-transactions-stats',
		authenticate(),
		wrapHandler(sentryTransactionsStatsHandler(apiToken))
	);

	router.use('/admin/sentry-transaction-events', cors(corsOptions));
	router.get(
		'/admin/sentry-transaction-events',
		authenticate(),
		wrapHandler(sentryTransactionEventsHandler(apiToken))
	);
}

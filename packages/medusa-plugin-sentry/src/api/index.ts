import { Router } from 'express';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { NodeOptions } from '@sentry/node/types/types';
import { Integration } from '@sentry/types/types/integration';
import { RequestHandlerOptions } from '@sentry/node/types/handlers';

export type SentryOptions = Omit<NodeOptions, 'integrations'> & {
	integrations: Integration[] | ((router: Router, sentry: typeof Sentry, tracing: typeof Tracing) => Integration[]);
	shouldHandleError: (code: number) => boolean;
	requestHandlerOptions?: RequestHandlerOptions;
	enableRequestHandler?: boolean;
	enableTracing?: boolean;
};

export default function (rootDirectory, pluginOptions: SentryOptions) {
	const router = Router();

	const {
		integrations,
		shouldHandleError = (code) => code >= 400,
		requestHandlerOptions = {},
		enableTracing = true,
		enableRequestHandler = true,
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

	const medusaErrorHandler = require('@medusajs/medusa/dist/api/middlewares/error-handler');
	const originalMedusaErrorHandler = medusaErrorHandler.default;
	medusaErrorHandler.default = () => {
		return (err, req, res, next) => {
			let statusCode;
			const res_ = {
				...res,
				status: (status) => {
					statusCode = status;
					return res;
				},
			};
			originalMedusaErrorHandler()(err, req, res_, next);
			Sentry.Handlers.errorHandler({
				shouldHandleError: () => shouldHandleError(statusCode),
			})(err, req, res, () => void 0);
		};
	};

	return router;
}

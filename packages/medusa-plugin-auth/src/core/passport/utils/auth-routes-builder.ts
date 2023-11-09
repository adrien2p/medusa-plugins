import { Router } from 'express';
import passport from 'passport';
import cors from 'cors';
import { TWENTY_FOUR_HOURS_IN_MS } from '../../../types';
import { authCallbackMiddleware } from '../../auth-callback-middleware';
import { ConfigModule } from '@medusajs/medusa/dist/types/global';

type PassportAuthenticateMiddlewareOptions = {
	[key: string]: unknown;
	scope?: unknown;
};

type PassportCallbackAuthenticateMiddlewareOptions = {
	[key: string]: unknown;
	failureRedirect: string;
};

/**
 * Build and return a router including the different route and configuration for a passport strategy
 * @param domain
 * @param configModule
 * @param authPath The path used to start the auth process e.g /admin/auth/google
 * @param authCallbackPath The pass used as the callback handler
 * @param strategyName The name use the define the strategy
 * @param passportAuthenticateMiddlewareOptions The options apply to the passport strategy on the auth path
 * @param passportCallbackAuthenticateMiddlewareOptions The options apply to the passport strategy on the callback auth path
 * @param expiresIn
 * @param successRedirect
 */
export function passportAuthRoutesBuilder({
	domain,
	configModule,
	authPath,
	strategyName,
	passportAuthenticateMiddlewareOptions,
	passportCallbackAuthenticateMiddlewareOptions,
	expiresIn,
	successRedirect,
	authCallbackPath,
}: {
	domain: 'admin' | 'store';
	configModule: ConfigModule;
	authPath: string;
	strategyName: string;
	passportAuthenticateMiddlewareOptions: PassportAuthenticateMiddlewareOptions;
	passportCallbackAuthenticateMiddlewareOptions: PassportCallbackAuthenticateMiddlewareOptions;
	expiresIn?: number;
	successRedirect: string;
	authCallbackPath: string;
}): Router {
	const router = Router();

	const originalSuccessRedirect = successRedirect;

	const corsOptions = {
		origin:
			domain === 'admin'
				? configModule.projectConfig.admin_cors.split(',')
				: configModule.projectConfig.store_cors.split(','),
		credentials: true,
	};

	router.get(authPath, cors(corsOptions));
	/* necessary if you are using non medusajs client such as a pure axios call, axios initially requests options and then get */
	router.options(authPath, cors(corsOptions));
	router.get(
		authPath,
		(req, res, next) => {
			// Allow to override the successRedirect by passing a query param `?redirectTo=your_url`
			successRedirect = (req.query.redirectTo ? req.query.redirectTo : originalSuccessRedirect) as string;
			next();
		},
		passport.authenticate(strategyName, {
			...passportAuthenticateMiddlewareOptions,
			session: false,
		})
	);

	const callbackHandler = authCallbackMiddleware(
		domain,
		configModule.projectConfig.jwt_secret,
		expiresIn ?? TWENTY_FOUR_HOURS_IN_MS,
		() => successRedirect
	);

	router.get(authCallbackPath, cors(corsOptions));
	router.get(
		authCallbackPath,
		(req, res, next) => {
			if (req.user) {
				return callbackHandler(req, res);
			}

			next();
		},
		function (req, res, next) {
			passport.authenticate(
				strategyName,
				Object.assign({}, passportCallbackAuthenticateMiddlewareOptions, {
					session: false,
					failureRedirect: false,
				}),
				(err, user, options) => {
					if (options?.msg) {
						if (passportCallbackAuthenticateMiddlewareOptions?.failureRedirect) {
							return res.redirect(
								passportCallbackAuthenticateMiddlewareOptions.failureRedirect + '?message=' + options.msg
							);
						} else {
							return res.status(401).json({ message: options.msg });
						}
					}
					if (!req.user) {
						req.user = user;
					}
					return callbackHandler(req, res);
				}
			)(req, res, next);
		}
	);

	return router;
}

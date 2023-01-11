import { RequestHandler, Router } from 'express';
import passport from 'passport';
import cors from 'cors';
import { GOOGLE_ADMIN_STRATEGY_NAME } from '../../../auth-strategies/google';
import { TWENTY_FOUR_HOURS_IN_MS } from '../../../types';
import { authCallbackMiddleware, firebaseCallbackMiddleware } from '../../auth-callback-middleware';
import { ConfigModule } from '@medusajs/medusa/dist/types/global';

/**
 * Build and return a router including the different route and configuration for a passport strategy
 * @param domain
 * @param configModule
 * @param authPath
 * @param passportAuthenticateMiddleware
 * @param expiresIn
 * @param successRedirect
 * @param authCallbackPath
 * @param failureRedirect
 */
export function passportAuthRoutesBuilder({
	domain,
	configModule,
	authPath,
	passportAuthenticateMiddleware,
	expiresIn,
	successRedirect,
	authCallbackPath,
	failureRedirect,
}: {
	domain: "admin" | "store",
	configModule: ConfigModule;
	authPath: string;
	passportAuthenticateMiddleware: RequestHandler<any>;
	expiresIn?: number;
	successRedirect: string;
	authCallbackPath: string;
	failureRedirect?: string;
}): Router {
	const router = Router();

	const corsOptions = {
		origin: domain === 'admin' ? configModule.projectConfig.admin_cors.split(',') : configModule.projectConfig.store_cors.split(','),
		credentials: true,
	};

	router.get(authPath, cors(corsOptions));
	/*necessary if you are using non medusajs client such as a pure axios call, axios initially requests options and then get*/
	router.options(authPath, cors(corsOptions));
	router.get(authPath, passportAuthenticateMiddleware);

	const callbackHandler = authCallbackMiddleware(
		domain,
		configModule.projectConfig.jwt_secret,
		expiresIn ?? TWENTY_FOUR_HOURS_IN_MS,
		successRedirect
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
		passport.authenticate(GOOGLE_ADMIN_STRATEGY_NAME, {
			failureRedirect,
			session: false,
		}),
		callbackHandler
	);

	return router;
}


export function firebaseAuthRoutesBuilder({
	domain,
	configModule,
	authPath,
	passportAuthenticateMiddleware,
	expiresIn,
}: {
	domain: "admin" | "store",
	configModule: ConfigModule;
	authPath: string;
	passportAuthenticateMiddleware: RequestHandler<any>;
	expiresIn?: number;
}): Router {
	const router = Router();

	const corsOptions = {
		origin: domain === 'admin' ? configModule.projectConfig.admin_cors.split(',') : configModule.projectConfig.store_cors.split(','),
		credentials: true,
	};

	router.get(authPath, cors(corsOptions));
	/*necessary if you are using non medusajs client such as a pure axios call, axios initially requests options and then get*/
	router.options(authPath, cors(corsOptions));

	const callbackHandler = firebaseCallbackMiddleware(
		domain,
		configModule.projectConfig.jwt_secret,
		expiresIn ?? TWENTY_FOUR_HOURS_IN_MS
	);

	router.get(authPath, passportAuthenticateMiddleware, callbackHandler);

	return router;
}
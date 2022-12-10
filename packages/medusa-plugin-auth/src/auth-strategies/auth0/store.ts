import passport from 'passport';
import { Router } from 'express';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Strategy as Auth0Strategy } from 'passport-auth0';
<<<<<<< HEAD
=======
import { CustomerService } from '@medusajs/medusa';
import { MedusaError } from 'medusa-core-utils';
import { EntityManager } from 'typeorm';
import {
	CUSTOMER_METADATA_KEY,
	AUTH_PROVIDER_KEY,
	STORE_AUTH_TOKEN_COOKIE_NAME,
	TWENTY_FOUR_HOURS_IN_MS,
} from '../../types';
import { buildCallbackHandler } from '../../core/utils/build-callback-handler';
import { PassportStrategy } from '../../core/Strategy';
>>>>>>> 224ee9c (Updated Tests and re-added Legacy authentication default)
import { Auth0Options, Profile, ExtraParams, AUTH0_STORE_STRATEGY_NAME } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateStoreCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';

export class Auth0StoreStrategy extends PassportStrategy(Auth0Strategy, AUTH0_STORE_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: Auth0Options
	) {
		super({
			domain: strategyOptions.auth0Domain,
			clientID: strategyOptions.clientID,
			clientSecret: strategyOptions.clientSecret,
			callbackURL: strategyOptions.store.callbackUrl,
			passReqToCallback: true,
			state: true,
		});
	}

	async validate(
		req: Request,
		accessToken: string,
		refreshToken: string,
		extraParams: ExtraParams,
		profile: Profile
	): Promise<null | { id: string }> {
		if (this.strategyOptions.store.verifyCallback) {
			return await this.strategyOptions.store.verifyCallback(
				this.container,
				req,
				accessToken,
				refreshToken,
				extraParams,
				profile
			);
		}
		return await validateStoreCallback(this)(profile, { strategyErrorIdentifier: 'auth0' });
	}
}

/**
 * Return the router that holds the auth0 store authentication routes
 * @param auth0
 * @param configModule
 */
export function getAuth0StoreAuthRouter(auth0: Auth0Options, configModule: ConfigModule): Router {
	return passportAuthRoutesBuilder({
		domain: 'store',
		configModule,
		authPath: auth0.store.authPath ?? '/store/auth/auth0',
		authCallbackPath: auth0.store.authCallbackPath ?? '/store/auth/auth0/cb',
		successRedirect: auth0.store.successRedirect,
		failureRedirect: auth0.store.failureRedirect,
		passportAuthenticateMiddleware: passport.authenticate(AUTH0_STORE_STRATEGY_NAME, {
			scope: 'openid email profile',
			session: false,
<<<<<<< HEAD
=======
		})
	);

	const expiresIn = auth0.store.expiresIn ?? TWENTY_FOUR_HOURS_IN_MS;
	const callbackHandler = buildCallbackHandler(
		'store',
		STORE_AUTH_TOKEN_COOKIE_NAME,
		configModule.projectConfig.jwt_secret,
		expiresIn,
		auth0.store.successRedirect
	);

	const authPathCb = auth0.store.authCallbackPath ?? '/store/auth/auth0/cb';

	router.get(authPathCb, cors(storeCorsOptions));
	router.get(
		authPathCb,
		(req, res, next) => {
			if (req.user) {
				return callbackHandler(req, res);
			}

			next();
		},
		passport.authenticate(AUTH0_STORE_STRATEGY_NAME, {
			failureRedirect: auth0.store.failureRedirect,
			session: false,
>>>>>>> 224ee9c (Updated Tests and re-added Legacy authentication default)
		}),
	});
}

import passport from 'passport';
import { Router } from 'express';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Strategy as Auth0Strategy } from 'passport-auth0';
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
		}),
	});
}

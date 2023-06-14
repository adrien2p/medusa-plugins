import { Router } from 'express';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Strategy as Auth0Strategy } from 'passport-auth0';
import { Auth0Options, Profile, ExtraParams, AUTH0_STORE_STRATEGY_NAME } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateStoreCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { AuthOptions } from '../../types';

export class Auth0StoreStrategy extends PassportStrategy(Auth0Strategy, AUTH0_STORE_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: Auth0Options,
		protected readonly strict?: AuthOptions['strict']
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
	): Promise<null | { id: string; accessToken: string }> {
		if (this.strategyOptions.store.verifyCallback) {
			const validateRes = await this.strategyOptions.store.verifyCallback(
				this.container,
				req,
				accessToken,
				refreshToken,
				extraParams,
				profile
			);

			return {
				...validateRes,
				accessToken,
			};
		}

		const validateRes = await validateStoreCallback(profile, {
			container: this.container,
			strategyErrorIdentifier: 'auth0',
			strict: this.strict,
		});
		return {
			...validateRes,
			accessToken,
		};
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
		strategyName: AUTH0_STORE_STRATEGY_NAME,
		passportAuthenticateMiddlewareOptions: {
			scope: 'openid email profile',
		},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: auth0.store.failureRedirect,
		},
		expiresIn: auth0.store.expiresIn,
	});
}

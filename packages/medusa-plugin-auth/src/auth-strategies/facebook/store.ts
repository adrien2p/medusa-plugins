import { Router } from 'express';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Strategy as FacebookStrategy, StrategyOptionsWithRequest } from 'passport-facebook';
import { FACEBOOK_STORE_STRATEGY_NAME, FacebookAuthOptions, Profile } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateStoreCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { AuthProvider, StrategyFactory } from '../../types';

export function getFacebookStoreStrategy(id: string): StrategyFactory<FacebookAuthOptions> {
	const strategyName = `${FACEBOOK_STORE_STRATEGY_NAME}_${id}`;
	return class extends PassportStrategy(FacebookStrategy, strategyName) {
		constructor(
			protected readonly container: MedusaContainer,
			protected readonly configModule: ConfigModule,
			protected readonly strategyOptions: FacebookAuthOptions,
			protected readonly strict?: AuthProvider['strict']
		) {
			super({
				clientID: strategyOptions.clientID,
				clientSecret: strategyOptions.clientSecret,
				callbackURL: strategyOptions.store.callbackUrl,
				passReqToCallback: true,
				profileFields: ['id', 'displayName', 'email', 'gender', 'name'],
			} as StrategyOptionsWithRequest);
		}

		async validate(
			req: Request,
			accessToken: string,
			refreshToken: string,
			profile: Profile
		): Promise<null | { id: string }> {
			if (this.strategyOptions.store.verifyCallback) {
				return await this.strategyOptions.store.verifyCallback(
					this.container,
					req,
					accessToken,
					refreshToken,
					profile,
					this.strict
				);
			}

			return await validateStoreCallback(profile, {
				container: this.container,
				strategyErrorIdentifier: 'facebook',
				strict: this.strict,
				strategyName,
			});
		}
	};
}

/**
 * Return the router that hold the facebook store authentication routes
 * @param id
 * @param facebook
 * @param configModule
 */
export function getFacebookStoreAuthRouter(
	id: string,
	facebook: FacebookAuthOptions,
	configModule: ConfigModule
): Router {
	const strategyName = `${FACEBOOK_STORE_STRATEGY_NAME}_${id}`;
	return passportAuthRoutesBuilder({
		domain: 'store',
		configModule,
		authPath: facebook.store.authPath ?? '/store/auth/facebook',
		authCallbackPath: facebook.store.authCallbackPath ?? '/store/auth/facebook/cb',
		successRedirect: facebook.store.successRedirect,
		strategyName,
		passportAuthenticateMiddlewareOptions: {
			scope: ['email'],
		},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: facebook.store.failureRedirect,
		},
		expiresIn: facebook.store.expiresIn,
	});
}

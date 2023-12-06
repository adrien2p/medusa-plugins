import { Router } from 'express';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Strategy as GoogleStrategy, StrategyOptionsWithRequest } from 'passport-google-oauth2';
import { PassportStrategy } from '../../core/passport/Strategy';
import { GOOGLE_STORE_STRATEGY_NAME, GoogleAuthOptions, Profile } from './types';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { validateStoreCallback } from '../../core/validate-callback';
import { AuthProvider, StrategyFactory } from '../../types';

export function getGoogleStoreStrategy(id: string): StrategyFactory<GoogleAuthOptions> {
	const strategyName = `${GOOGLE_STORE_STRATEGY_NAME}_${id}`;
	return class GoogleStoreStrategy extends PassportStrategy(GoogleStrategy, strategyName) {
		constructor(
			protected readonly container: MedusaContainer,
			protected readonly configModule: ConfigModule,
			protected readonly strategyOptions: GoogleAuthOptions,
			protected readonly strict?: AuthProvider['strict']
		) {
			super({
				clientID: strategyOptions.clientID,
				clientSecret: strategyOptions.clientSecret,
				callbackURL: strategyOptions.store.callbackUrl,
				passReqToCallback: true,
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
				strategyErrorIdentifier: 'google',
				strict: this.strict,
				strategyName,
			});
		}
	};
}

/**
 * Return the router that hold the google store authentication routes
 * @param id
 * @param google
 * @param configModule
 */
export function getGoogleStoreAuthRouter(id: string, google: GoogleAuthOptions, configModule: ConfigModule): Router {
	const strategyName = `${GOOGLE_STORE_STRATEGY_NAME}_${id}`;
	return passportAuthRoutesBuilder({
		domain: 'store',
		configModule,
		authPath: google.store.authPath ?? '/store/auth/google',
		authCallbackPath: google.store.authCallbackPath ?? '/store/auth/google/cb',
		successRedirect: google.store.successRedirect,
		strategyName,
		passportAuthenticateMiddlewareOptions: {
			scope: [
				'https://www.googleapis.com/auth/userinfo.email',
				'https://www.googleapis.com/auth/userinfo.profile',
			],
		},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: google.store.failureRedirect,
		},
		expiresIn: google.store.expiresIn,
	});
}

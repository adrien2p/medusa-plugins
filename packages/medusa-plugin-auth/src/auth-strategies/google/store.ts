import { Router } from 'express';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { PassportStrategy } from '../../core/passport/Strategy';
import { GOOGLE_STORE_STRATEGY_NAME, GoogleAuthOptions, Profile } from './types';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { validateStoreCallback } from '../../core/validate-callback';

export class GoogleStoreStrategy extends PassportStrategy(GoogleStrategy, GOOGLE_STORE_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: GoogleAuthOptions
	) {
		super({
			clientID: strategyOptions.clientID,
			clientSecret: strategyOptions.clientSecret,
			callbackURL: strategyOptions.store.callbackUrl,
			passReqToCallback: true,
		});
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
				profile
			);
		}
		return await validateStoreCallback(profile, { container: this.container, strategyErrorIdentifier: 'google' });
	}
}

/**
 * Return the router that hold the google store authentication routes
 * @param google
 * @param configModule
 */
export function getGoogleStoreAuthRouter(google: GoogleAuthOptions, configModule: ConfigModule): Router {
	return passportAuthRoutesBuilder({
		domain: 'store',
		configModule,
		authPath: google.store.authPath ?? '/store/auth/google',
		authCallbackPath: google.store.authCallbackPath ?? '/store/auth/google/cb',
		successRedirect: google.store.successRedirect,
		strategyName: GOOGLE_STORE_STRATEGY_NAME,
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

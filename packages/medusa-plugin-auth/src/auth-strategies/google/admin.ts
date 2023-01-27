import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { GOOGLE_ADMIN_STRATEGY_NAME, GoogleAuthOptions, Profile } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateAdminCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';

export class GoogleAdminStrategy extends PassportStrategy(GoogleStrategy, GOOGLE_ADMIN_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: GoogleAuthOptions
	) {
		super({
			clientID: strategyOptions.clientID,
			clientSecret: strategyOptions.clientSecret,
			callbackURL: strategyOptions.admin.callbackUrl,
			passReqToCallback: true,
		});
	}

	async validate(
		req: Request,
		accessToken: string,
		refreshToken: string,
		profile: Profile
	): Promise<null | { id: string }> {
		if (this.strategyOptions.admin.verifyCallback) {
			return await this.strategyOptions.admin.verifyCallback(
				this.container,
				req,
				accessToken,
				refreshToken,
				profile
			);
		}

		return await validateAdminCallback(profile, { container: this.container, strategyErrorIdentifier: 'google' });
	}
}

/**
 * Return the router that hold the google admin authentication routes
 * @param google
 * @param configModule
 */
export function getGoogleAdminAuthRouter(google: GoogleAuthOptions, configModule: ConfigModule): Router {
	return passportAuthRoutesBuilder({
		domain: 'admin',
		configModule,
		authPath: google.admin.authPath ?? '/admin/auth/google',
		authCallbackPath: google.admin.authCallbackPath ?? '/admin/auth/google/cb',
		successRedirect: google.admin.successRedirect,
		strategyName: GOOGLE_ADMIN_STRATEGY_NAME,
		passportAuthenticateMiddlewareOptions: {
			scope: [
				'https://www.googleapis.com/auth/userinfo.email',
				'https://www.googleapis.com/auth/userinfo.profile',
			],
		},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: google.admin.failureRedirect,
		},
		expiresIn: google.admin.expiresIn,
	});
}

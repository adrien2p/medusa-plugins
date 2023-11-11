import { Strategy as LinkedinStrategy } from 'passport-linkedin-oauth2';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { LINKEDIN_ADMIN_STRATEGY_NAME, LinkedinAuthOptions, Profile } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateAdminCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { AuthOptions } from '../../types';

export class LinkedinAdminStrategy extends PassportStrategy(LinkedinStrategy, LINKEDIN_ADMIN_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: LinkedinAuthOptions,
		protected readonly strict?: AuthOptions['strict']
	) {
		super({
			clientID: strategyOptions.clientID,
			clientSecret: strategyOptions.clientSecret,
			callbackURL: strategyOptions.admin.callbackUrl,
			passReqToCallback: true,
			scope: ['r_emailaddress'],
			state: true,
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
				profile,
				this.strict
			);
		}

		return await validateAdminCallback(profile, {
			container: this.container,
			strategyErrorIdentifier: 'linkedin',
			strict: this.strict,
		});
	}
}

/**
 * Return the router that hold the linkedin admin authentication routes
 * @param linkedin
 * @param configModule
 */
export function getLinkedinAdminAuthRouter(linkedin: LinkedinAuthOptions, configModule: ConfigModule): Router {
	return passportAuthRoutesBuilder({
		domain: 'admin',
		configModule,
		authPath: linkedin.admin.authPath ?? '/admin/auth/linkedin',
		authCallbackPath: linkedin.admin.authCallbackPath ?? '/admin/auth/linkedin/cb',
		successRedirect: linkedin.admin.successRedirect,
		strategyName: LINKEDIN_ADMIN_STRATEGY_NAME,
		passportAuthenticateMiddlewareOptions: {
			scope: [
				'https://www.linkedinapis.com/auth/userinfo.email',
				'https://www.linkedinapis.com/auth/userinfo.profile',
			],
		},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: linkedin.admin.failureRedirect,
		},
		expiresIn: linkedin.admin.expiresIn,
	});
}

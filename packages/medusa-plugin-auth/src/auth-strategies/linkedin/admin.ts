import { Strategy as LinkedinStrategy, StrategyOptionWithRequest } from 'passport-linkedin-oauth2';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { LINKEDIN_ADMIN_STRATEGY_NAME, LinkedinAuthOptions, Profile } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateAdminCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { AuthProvider, StrategyFactory } from '../../types';

export function getLinkedinAdminStrategy(id: string): StrategyFactory<LinkedinAuthOptions> {
	const strategyName = `${LINKEDIN_ADMIN_STRATEGY_NAME}_${id}`;
	return class extends PassportStrategy(LinkedinStrategy, strategyName) {
		constructor(
			protected readonly container: MedusaContainer,
			protected readonly configModule: ConfigModule,
			protected readonly strategyOptions: LinkedinAuthOptions,
			protected readonly strict?: AuthProvider['strict']
		) {
			super({
				clientID: strategyOptions.clientID,
				clientSecret: strategyOptions.clientSecret,
				callbackURL: strategyOptions.admin.callbackUrl,
				passReqToCallback: true,
				scope: ['r_emailaddress'],
				state: true,
			} as StrategyOptionWithRequest);
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
				strategyName,
			});
		}
	};
}

/**
 * Return the router that hold the linkedin admin authentication routes
 * @param id
 * @param linkedin
 * @param configModule
 */
export function getLinkedinAdminAuthRouter(
	id: string,
	linkedin: LinkedinAuthOptions,
	configModule: ConfigModule
): Router {
	const strategyName = `${LINKEDIN_ADMIN_STRATEGY_NAME}_${id}`;
	return passportAuthRoutesBuilder({
		domain: 'admin',
		configModule,
		authPath: linkedin.admin.authPath ?? '/admin/auth/linkedin',
		authCallbackPath: linkedin.admin.authCallbackPath ?? '/admin/auth/linkedin/cb',
		successRedirect: linkedin.admin.successRedirect,
		strategyName,
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

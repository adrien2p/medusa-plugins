import { Router } from 'express';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Strategy as LinkedinStrategy } from 'passport-linkedin-oauth2';
import { PassportStrategy } from '../../core/passport/Strategy';
import { LINKEDIN_STORE_STRATEGY_NAME, LinkedinAuthOptions, Profile } from './types';
import { validateStoreCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { AuthOptions } from '../../types';

export class LinkedinStoreStrategy extends PassportStrategy(LinkedinStrategy, LINKEDIN_STORE_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: LinkedinAuthOptions,
		protected readonly strict?: AuthOptions['strict']
	) {
		super({
			clientID: strategyOptions.clientID,
			clientSecret: strategyOptions.clientSecret,
			callbackURL: strategyOptions.store.callbackUrl,
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
			strategyErrorIdentifier: 'linkedin',
			strict: this.strict,
		});
	}
}

/**
 * Return the router that hold the linkedin store authentication routes
 * @param linkedin
 * @param configModule
 */
export function getLinkedinStoreAuthRouter(linkedin: LinkedinAuthOptions, configModule: ConfigModule): Router {
	return passportAuthRoutesBuilder({
		domain: 'store',
		configModule,
		authPath: linkedin.store.authPath ?? '/store/auth/linkedin',
		authCallbackPath: linkedin.store.authCallbackPath ?? '/store/auth/linkedin/cb',
		successRedirect: linkedin.store.successRedirect,
		strategyName: LINKEDIN_STORE_STRATEGY_NAME,
		passportAuthenticateMiddlewareOptions: {
			scope: [
				'https://www.linkedinapis.com/auth/userinfo.email',
				'https://www.linkedinapis.com/auth/userinfo.profile',
			],
		},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: linkedin.store.failureRedirect,
		},
	});
}

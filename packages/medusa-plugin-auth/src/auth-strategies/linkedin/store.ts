import { Router } from 'express';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Strategy as LinkedinStrategy, StrategyOptionWithRequest } from 'passport-linkedin-oauth2';
import { PassportStrategy } from '../../core/passport/Strategy';
import { LINKEDIN_STORE_STRATEGY_NAME, LinkedinAuthOptions, Profile } from './types';
import { validateStoreCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { AuthProvider, StrategyFactory } from '../../types';

export function getLinkedinStoreStrategy(id: string): StrategyFactory<LinkedinAuthOptions> {
	const strategyName = `${LINKEDIN_STORE_STRATEGY_NAME}_${id}`;
	return class LinkedinStoreStrategy extends PassportStrategy(LinkedinStrategy, strategyName) {
		constructor(
			protected readonly container: MedusaContainer,
			protected readonly configModule: ConfigModule,
			protected readonly strategyOptions: LinkedinAuthOptions,
			protected readonly strict?: AuthProvider['strict']
		) {
			super({
				clientID: strategyOptions.clientID,
				clientSecret: strategyOptions.clientSecret,
				callbackURL: strategyOptions.store.callbackUrl,
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
				strategyName,
			});
		}
	};
}

/**
 * Return the router that hold the linkedin store authentication routes
 * @param id
 * @param linkedin
 * @param configModule
 */
export function getLinkedinStoreAuthRouter(
	id: string,
	linkedin: LinkedinAuthOptions,
	configModule: ConfigModule
): Router {
	const strategyName = `${LINKEDIN_STORE_STRATEGY_NAME}_${id}`;
	return passportAuthRoutesBuilder({
		domain: 'store',
		configModule,
		authPath: linkedin.store.authPath ?? '/store/auth/linkedin',
		authCallbackPath: linkedin.store.authCallbackPath ?? '/store/auth/linkedin/cb',
		successRedirect: linkedin.store.successRedirect,
		strategyName,
		passportAuthenticateMiddlewareOptions: {
			scope: [
				'https://www.linkedinapis.com/auth/userinfo.email',
				'https://www.linkedinapis.com/auth/userinfo.profile',
			],
		},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: linkedin.store.failureRedirect,
		},
		expiresIn: linkedin.store.expiresIn,
	});
}

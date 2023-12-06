import { Strategy as FacebookStrategy, StrategyOptionsWithRequest } from 'passport-facebook';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { FACEBOOK_ADMIN_STRATEGY_NAME, FacebookAuthOptions, Profile } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateAdminCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { AuthProvider, StrategyFactory } from '../../types';

export function getFacebookAdminStrategy(id: string): StrategyFactory<FacebookAuthOptions> {
	const strategyName = `${FACEBOOK_ADMIN_STRATEGY_NAME}_${id}`;
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
				callbackURL: strategyOptions.admin.callbackUrl,
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
				strategyErrorIdentifier: 'facebook',
				strict: this.strict,
				strategyName,
			});
		}
	};
}

/**
 * Return the router that hold the facebook admin authentication routes
 * @param id
 * @param facebook
 * @param configModule
 */
export function getFacebookAdminAuthRouter(
	id: string,
	facebook: FacebookAuthOptions,
	configModule: ConfigModule
): Router {
	const strategyName = `${FACEBOOK_ADMIN_STRATEGY_NAME}_${id}`;
	return passportAuthRoutesBuilder({
		domain: 'admin',
		configModule,
		authPath: facebook.admin.authPath ?? '/admin/auth/facebook',
		authCallbackPath: facebook.admin.authCallbackPath ?? '/admin/auth/facebook/cb',
		successRedirect: facebook.admin.successRedirect,
		strategyName,
		passportAuthenticateMiddlewareOptions: {
			scope: ['email'],
		},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: facebook.admin.failureRedirect,
		},
		expiresIn: facebook.admin.expiresIn,
	});
}

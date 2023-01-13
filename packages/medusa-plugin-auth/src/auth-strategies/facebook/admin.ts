import { Strategy as FacebookStrategy } from 'passport-facebook';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { FACEBOOK_ADMIN_STRATEGY_NAME, FacebookAuthOptions, Profile } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateAdminCallback } from "../../core/validate-callback";
import { passportAuthRoutesBuilder } from "../../core/passport/utils/auth-routes-builder";

export class FacebookAdminStrategy extends PassportStrategy(FacebookStrategy, FACEBOOK_ADMIN_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: FacebookAuthOptions
	) {
		super({
			clientID: strategyOptions.clientID,
			clientSecret: strategyOptions.clientSecret,
			callbackURL: strategyOptions.admin.callbackUrl,
			passReqToCallback: true,
			profileFields: ['id', 'displayName', 'email', 'gender', 'name'],
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
		return await validateAdminCallback(this)(profile, { strategyErrorIdentifier: 'Facebook' });
	}
}

/**
 * Return the router that hold the facebook admin authentication routes
 * @param facebook
 * @param configModule
 */
export function getFacebookAdminAuthRouter(facebook: FacebookAuthOptions, configModule: ConfigModule): Router {
	return passportAuthRoutesBuilder({
		domain: "admin",
		configModule,
		authPath: facebook.admin.authPath ?? '/admin/auth/facebook',
		authCallbackPath: facebook.admin.authCallbackPath ?? '/admin/auth/facebook/cb',
		successRedirect: facebook.admin.successRedirect,
		strategyName: FACEBOOK_ADMIN_STRATEGY_NAME,
		passportAuthenticateMiddlewareOptions: {
			scope: ['email'],
		},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: facebook.admin.failureRedirect
		}
	});
}

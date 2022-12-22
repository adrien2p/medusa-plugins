import passport from 'passport';
import { Router } from 'express';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { FACEBOOK_STORE_STRATEGY_NAME, FacebookAuthOptions, Profile } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateStoreCallback } from "../../core/validate-callback";
import { passportAuthRoutesBuilder } from "../../core/passport/utils/auth-routes-builder";

export class FacebookStoreStrategy extends PassportStrategy(FacebookStrategy, FACEBOOK_STORE_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: FacebookAuthOptions
	) {
		super({
			clientID: strategyOptions.clientID,
			clientSecret: strategyOptions.clientSecret,
			callbackURL: strategyOptions.store.callbackUrl,
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
		if (this.strategyOptions.store.verifyCallback) {
			return await this.strategyOptions.store.verifyCallback(
				this.container,
				req,
				accessToken,
				refreshToken,
				profile
			);
		}
		return await validateStoreCallback(this)(profile, { strategyErrorIdentifier: "Facebook" });
	}
}

/**
 * Return the router that hold the facebook store authentication routes
 * @param facebook
 * @param configModule
 */
export function getFacebookStoreAuthRouter(facebook: FacebookAuthOptions, configModule: ConfigModule): Router {
	return passportAuthRoutesBuilder(
		{
			domain: "store",
		configModule,
		authPath: facebook.store.authPath ?? '/store/auth/facebook',
		authCallbackPath: facebook.store.authCallbackPath ?? '/store/auth/facebook/cb',
		successRedirect: facebook.store.successRedirect,
		failureRedirect: facebook.store.failureRedirect,
		passportAuthenticateMiddleware: passport.authenticate(FACEBOOK_STORE_STRATEGY_NAME, {
			scope: ['email'],
			session: false,
		})
	});
}

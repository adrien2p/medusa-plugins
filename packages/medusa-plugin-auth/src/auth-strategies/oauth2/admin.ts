import {Strategy as OAuth2Strategy, StrategyOptionsWithRequest} from 'passport-oauth2';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { OAUTH2_ADMIN_STRATEGY_NAME, OAuth2AuthOptions, Profile } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateAdminCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { AuthOptions } from '../../types';

export class OAuth2AdminStrategy extends PassportStrategy(OAuth2Strategy, OAUTH2_ADMIN_STRATEGY_NAME) {

	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: OAuth2AuthOptions,
		protected readonly strict?: AuthOptions['strict']
	) {
		super({
			authorizationURL: strategyOptions.authorizationURL,
			tokenURL: strategyOptions.tokenURL,
			clientID: strategyOptions.clientID,
			clientSecret: strategyOptions.clientSecret,
			callbackURL: strategyOptions.admin.callbackUrl,
			passReqToCallback: true,
			scope: strategyOptions.scope,
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
			strategyErrorIdentifier: 'oauth2',
			strict: this.strict,
		});
	}
}

/**
 * Return the router that hold the oauth2 admin authentication routes
 * @param oauth2
 * @param configModule
 */
export function getOAuth2AdminAuthRouter(oauth2: OAuth2AuthOptions, configModule: ConfigModule): Router {
	return passportAuthRoutesBuilder({
		domain: 'admin',
		configModule,
		authPath: oauth2.admin.authPath ?? '/admin/auth/oauth2',
		authCallbackPath: oauth2.admin.authCallbackPath ?? '/admin/auth/oauth2/cb',
		successRedirect: oauth2.admin.successRedirect,
		strategyName: OAUTH2_ADMIN_STRATEGY_NAME,
		passportAuthenticateMiddlewareOptions: {},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: oauth2.admin.failureRedirect,
		},
		expiresIn: oauth2.admin.expiresIn,
	});
}

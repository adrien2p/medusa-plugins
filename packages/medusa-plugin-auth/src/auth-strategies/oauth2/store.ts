import { Router } from 'express';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import {Strategy as OAuth2Strategy, StrategyOptionsWithRequest} from 'passport-oauth2';
import { PassportStrategy } from '../../core/passport/Strategy';
import { OAUTH2_STORE_STRATEGY_NAME, OAuth2AuthOptions, Profile } from './types';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { validateStoreCallback } from '../../core/validate-callback';
import { AuthOptions } from '../../types';

export class OAuth2StoreStrategy extends PassportStrategy(OAuth2Strategy, OAUTH2_STORE_STRATEGY_NAME) {
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
			callbackURL: strategyOptions.store.callbackUrl,
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
			strategyErrorIdentifier: 'oauth2',
			strict: this.strict,
		});
	}
}

/**
 * Return the router that hold the oauth2 store authentication routes
 * @param oauth2
 * @param configModule
 */
export function getOAuth2StoreAuthRouter(oauth2: OAuth2AuthOptions, configModule: ConfigModule): Router {
	return passportAuthRoutesBuilder({
		domain: 'store',
		configModule,
		authPath: oauth2.store.authPath ?? '/store/auth/oauth2',
		authCallbackPath: oauth2.store.authCallbackPath ?? '/store/auth/oauth2/cb',
		successRedirect: oauth2.store.successRedirect,
		strategyName: OAUTH2_STORE_STRATEGY_NAME,
		passportAuthenticateMiddlewareOptions: {},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: oauth2.store.failureRedirect,
		},
		expiresIn: oauth2.store.expiresIn,
	});
}

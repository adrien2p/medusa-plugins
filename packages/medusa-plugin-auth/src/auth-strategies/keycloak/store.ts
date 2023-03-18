import { Router } from 'express';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Strategy as KeycloakStrategy } from "passport-oauth2";
import { KeycloakOptions, Profile, ExtraParams, KEYCLOAK_STORE_STRATEGY_NAME } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateStoreCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';

export class KeycloakStoreStrategy extends PassportStrategy(KeycloakStrategy, KEYCLOAK_STORE_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: KeycloakOptions
	) {
		super({
      authorizationURL: strategyOptions.authorizationURL,
      tokenURL: strategyOptions.tokenURL,
      clientID: strategyOptions.clientID,
      clientSecret: strategyOptions.clientSecret,
      callbackURL: strategyOptions.admin.callbackUrl,
      passReqToCallback: true,
      state: true,
		});
	}

	async validate(
		req: Request,
		accessToken: string,
		refreshToken: string,
		extraParams: ExtraParams,
		profile: Profile
	): Promise<null | { id: string; accessToken: string }> {
    console.log('validate store')
		if (this.strategyOptions.store.verifyCallback) {
			const validateRes = await this.strategyOptions.store.verifyCallback(
				this.container,
				req,
				accessToken,
				refreshToken,
				extraParams,
				profile
			);

			return {
				...validateRes,
				accessToken,
			};
		}
		const validateRes = await validateStoreCallback(profile, {
			container: this.container,
			strategyErrorIdentifier: 'keycloak',
		});
		return {
			...validateRes,
			accessToken,
		};
	}
}

/**
 * Return the router that holds the keycloak store authentication routes
 * @param keycloak
 * @param configModule
 */
export function getKeycloakStoreAuthRouter(keycloak: KeycloakOptions, configModule: ConfigModule): Router {
	return passportAuthRoutesBuilder({
		domain: 'store',
		configModule,
		authPath: keycloak.store.authPath ?? '/store/auth/keycloak',
		authCallbackPath: keycloak.store.authCallbackPath ?? '/store/auth/keycloak/cb',
		successRedirect: keycloak.store.successRedirect,
		strategyName: KEYCLOAK_STORE_STRATEGY_NAME,
		passportAuthenticateMiddlewareOptions: {
			scope: 'openid email profile',
		},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: keycloak.store.failureRedirect,
		},
		expiresIn: keycloak.store.expiresIn,
	});
}

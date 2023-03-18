import { OAuth2Strategy as KeycloakStrategy } from 'passport-oauth2';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { KEYCLOAK_ADMIN_STRATEGY_NAME, KeycloakOptions, Profile, ExtraParams } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateAdminCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';

export class KeycloakAdminStrategy extends PassportStrategy(KeycloakStrategy, KEYCLOAK_ADMIN_STRATEGY_NAME) {
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
    console.log('validate admin')
		if (this.strategyOptions.admin.verifyCallback) {
			const validateRes = await this.strategyOptions.admin.verifyCallback(
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
		const validateRes = await validateAdminCallback(profile, {
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
 * Return the router that holds the keycloak admin authentication routes
 * @param keycloak
 * @param configModule
 */
export function getKeycloakAdminAuthRouter(keycloak: KeycloakOptions, configModule: ConfigModule): Router {
	return passportAuthRoutesBuilder({
		domain: 'admin',
		configModule,
		authPath: keycloak.admin.authPath ?? '/admin/auth/keycloak',
		authCallbackPath: keycloak.admin.authCallbackPath ?? '/admin/auth/keycloak/cb',
		successRedirect: keycloak.admin.successRedirect,
		strategyName: KEYCLOAK_ADMIN_STRATEGY_NAME,
		passportAuthenticateMiddlewareOptions: {
			scope: 'openid email profile',
		},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: keycloak.admin.failureRedirect,
		},
		expiresIn: keycloak.admin.expiresIn,
	});
}

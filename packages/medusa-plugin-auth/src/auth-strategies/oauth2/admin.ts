import { Strategy as OAuth2Strategy, StrategyOptionsWithRequest } from 'passport-oauth2';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { OAUTH2_ADMIN_STRATEGY_NAME, OAuth2AuthOptions, Profile } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateAdminCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { AuthProvider, StrategyFactory } from '../../types';

export function getOAuth2AdminStrategy(id: string): StrategyFactory<OAuth2AuthOptions> {
	const strategyName = `${OAUTH2_ADMIN_STRATEGY_NAME}_${id}`;
	return class extends PassportStrategy(OAuth2Strategy, strategyName) {
		constructor(
			protected readonly container: MedusaContainer,
			protected readonly configModule: ConfigModule,
			protected readonly strategyOptions: OAuth2AuthOptions,
			protected readonly strict?: AuthProvider['strict']
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
				strategyName,
			});
		}

		userProfile(accessToken, done: (err: any, profile?: any) => void) {
			if (this.strategyOptions.parseProfile !== undefined) {
				let json;

				try {
					json = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
				} catch (ex) {
					return done(new Error('Failed to parse access token'));
				}

				const profile = this.strategyOptions.parseProfile(json);
				done(null, profile);
			} else {
				super.userProfile(accessToken, done);
			}
		}
	};
}

/**
 * Return the router that hold the oauth2 admin authentication routes
 * @param id
 * @param oauth2
 * @param configModule
 */
export function getOAuth2AdminAuthRouter(id: string, oauth2: OAuth2AuthOptions, configModule: ConfigModule): Router {
	const strategyName = `${OAUTH2_ADMIN_STRATEGY_NAME}_${id}`;
	return passportAuthRoutesBuilder({
		domain: 'admin',
		configModule,
		authPath: oauth2.admin.authPath ?? '/admin/auth/oauth2',
		authCallbackPath: oauth2.admin.authCallbackPath ?? '/admin/auth/oauth2/cb',
		successRedirect: oauth2.admin.successRedirect,
		strategyName,
		passportAuthenticateMiddlewareOptions: {},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: oauth2.admin.failureRedirect,
		},
		expiresIn: oauth2.admin.expiresIn,
	});
}

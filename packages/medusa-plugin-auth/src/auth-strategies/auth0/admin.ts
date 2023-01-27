import { Strategy as Auth0Strategy } from 'passport-auth0';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { AUTH0_ADMIN_STRATEGY_NAME, Auth0Options, Profile, ExtraParams } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateAdminCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';

export class Auth0AdminStrategy extends PassportStrategy(Auth0Strategy, AUTH0_ADMIN_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: Auth0Options
	) {
		super({
			domain: strategyOptions.auth0Domain,
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
			strategyErrorIdentifier: 'auth0',
		});
		return {
			...validateRes,
			accessToken,
		};
	}
}

/**
 * Return the router that holds the auth0 admin authentication routes
 * @param auth0
 * @param configModule
 */
export function getAuth0AdminAuthRouter(auth0: Auth0Options, configModule: ConfigModule): Router {
	return passportAuthRoutesBuilder({
		domain: 'admin',
		configModule,
		authPath: auth0.admin.authPath ?? '/admin/auth/auth0',
		authCallbackPath: auth0.admin.authCallbackPath ?? '/admin/auth/auth0/cb',
		successRedirect: auth0.admin.successRedirect,
		strategyName: AUTH0_ADMIN_STRATEGY_NAME,
		passportAuthenticateMiddlewareOptions: {
			scope: 'openid email profile',
		},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: auth0.admin.failureRedirect,
		},
		expiresIn: auth0.admin.expiresIn,
	});
}

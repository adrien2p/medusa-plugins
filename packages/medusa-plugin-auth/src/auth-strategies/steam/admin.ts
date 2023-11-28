import {Strategy as SteamStrategy} from 'passport-steam';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { STEAM_ADMIN_STRATEGY_NAME, SteamAuthOptions, Profile } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateAdminCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { AuthOptions } from '../../types';

export class SteamAdminStrategy extends PassportStrategy(SteamStrategy, STEAM_ADMIN_STRATEGY_NAME) {

	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: SteamAuthOptions,
		protected readonly strict?: AuthOptions['strict']
	) {
		super({
			returnURL: strategyOptions.admin.callbackUrl,
			realm: strategyOptions.realm,
			apiKey: strategyOptions.apiKey,
			passReqToCallback: true,
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
				profile,
				this.strict
			);
		}

		return await validateAdminCallback(profile, {
			container: this.container,
			strategyErrorIdentifier: 'steam',
			strict: this.strict,
		});
	}
}

/**
 * Return the router that hold the steam admin authentication routes
 * @param steam
 * @param configModule
 */
export function getSteamAdminAuthRouter(steam: SteamAuthOptions, configModule: ConfigModule): Router {
	return passportAuthRoutesBuilder({
		domain: 'admin',
		configModule,
		authPath: steam.admin.authPath ?? '/admin/auth/steam',
		authCallbackPath: steam.admin.authCallbackPath ?? '/admin/auth/steam/cb',
		successRedirect: steam.admin.successRedirect,
		strategyName: STEAM_ADMIN_STRATEGY_NAME,
		passportAuthenticateMiddlewareOptions: {},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: steam.admin.failureRedirect,
		},
		expiresIn: steam.admin.expiresIn,
	});
}

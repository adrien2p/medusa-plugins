import { Router } from 'express';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import {Strategy as SteamStrategy} from 'passport-steam';
import { PassportStrategy } from '../../core/passport/Strategy';
import { STEAM_STORE_STRATEGY_NAME, SteamAuthOptions, Profile } from './types';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { validateStoreCallback } from '../../core/validate-callback';
import { AuthOptions } from '../../types';

export class SteamStoreStrategy extends PassportStrategy(SteamStrategy, STEAM_STORE_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: SteamAuthOptions,
		protected readonly strict?: AuthOptions['strict']
	) {
		super({
			returnURL: strategyOptions.store.callbackUrl,
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
			strategyErrorIdentifier: 'steam',
			strict: this.strict,
		});
	}
}

/**
 * Return the router that hold the steam store authentication routes
 * @param steam
 * @param configModule
 */
export function getSteamStoreAuthRouter(steam: SteamAuthOptions, configModule: ConfigModule): Router {
	return passportAuthRoutesBuilder({
		domain: 'store',
		configModule,
		authPath: steam.store.authPath ?? '/store/auth/steam',
		authCallbackPath: steam.store.authCallbackPath ?? '/store/auth/steam/cb',
		successRedirect: steam.store.successRedirect,
		strategyName: STEAM_STORE_STRATEGY_NAME,
		passportAuthenticateMiddlewareOptions: {},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: steam.store.failureRedirect,
		},
		expiresIn: steam.store.expiresIn,
	});
}

import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { SUPABASE_AUTH_ADMIN_STRATEGY_NAME, SupabaseAuthOptions, Profile, ExtraParams } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateAdminCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { AuthOptions } from '../../types';
import { createClient } from '@supabase/supabase-js';

export class SupabaseAdminStrategy extends PassportStrategy(createClient, SUPABASE_AUTH_ADMIN_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: SupabaseAuthOptions,
		protected readonly strict?: AuthOptions['strict']
	) {
		super({
			url: strategyOptions.supabaseUrl,
			key: strategyOptions.supabaseKey,
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
				profile,
				this.strict
			);

			return {
				...validateRes,
				accessToken,
			};
		}
		const validateRes = await validateAdminCallback(profile, {
			container: this.container,
			strategyErrorIdentifier: "supabase",
			strict: this.strict,
		});
		return {
			...validateRes,
			accessToken,
		};
	}
}

/**
 * Return the router that holds the supabase admin authentication routes
 * @param supabase
 * @param configModule
 */
export function getSupabaseAdminAuthRouter(supabase: SupabaseAuthOptions, configModule: ConfigModule): Router {
	return passportAuthRoutesBuilder({
		domain: 'admin',
		configModule,
		authPath: supabase.admin.authPath ?? '/admin/auth/supabase',
		authCallbackPath: supabase.admin.authCallbackPath ?? '/admin/auth/supabase/cb',
		successRedirect: supabase.admin.successRedirect,
		strategyName: SUPABASE_AUTH_ADMIN_STRATEGY_NAME,
		passportAuthenticateMiddlewareOptions: {
			scope: 'openid email profile',
		},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: supabase.admin.failureRedirect,
		},
		expiresIn: supabase.admin.expiresIn,
	});
}

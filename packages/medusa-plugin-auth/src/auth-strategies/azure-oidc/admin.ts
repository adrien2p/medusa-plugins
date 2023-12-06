import { IOIDCStrategyOptionWithRequest, IProfile, OIDCStrategy as AzureStrategy } from 'passport-azure-ad';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { AZURE_ADMIN_STRATEGY_NAME, AzureAuthOptions, Profile, ResponseMode, ResponseType } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateAdminCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { AuthProvider, StrategyFactory } from '../../types';

/**
 * Return the azure admin strategy
 * @param id
 */
export function getAzureAdminStrategy(id: string): StrategyFactory<AzureAuthOptions> {
	const strategyName = `${AZURE_ADMIN_STRATEGY_NAME}_${id}`;
	return class extends PassportStrategy(AzureStrategy, strategyName) {
		constructor(
			protected readonly container: MedusaContainer,
			protected readonly configModule: ConfigModule,
			protected readonly strategyOptions: AzureAuthOptions,
			protected readonly strict?: AuthProvider['strict']
		) {
			super({
				identityMetadata: strategyOptions.admin.identityMetadata,
				clientID: strategyOptions.admin.clientID,
				clientSecret: strategyOptions.admin.clientSecret,
				responseType: strategyOptions.admin.responseType ?? ResponseType.Code,
				responseMode: strategyOptions.admin.responseMode ?? ResponseMode.Query,
				redirectUrl: strategyOptions.admin.callbackUrl,
				allowHttpForRedirectUrl: strategyOptions.admin.allowHttpForRedirectUrl ?? false,
				validateIssuer: strategyOptions.admin.validateIssuer ?? true,
				isB2C: strategyOptions.admin.isB2C ?? false,
				issuer: strategyOptions.admin.issuer,
				passReqToCallback: true,
			} as IOIDCStrategyOptionWithRequest);
		}

		async validate(req: Request, profile: IProfile): Promise<null | { id: string }> {
			if (this.strategyOptions.admin.verifyCallback) {
				return await this.strategyOptions.admin.verifyCallback(this.container, req, profile, this.strict);
			}

			const authprofile: Profile = {
				emails: [{ value: profile?.upn }],
				name: { givenName: profile?.name?.givenName, familyName: profile?.name?.familyName },
			};

			return await validateAdminCallback(authprofile, {
				container: this.container,
				strategyErrorIdentifier: 'azure_oidc',
				strict: this.strict,
				strategyName,
			});
		}
	};
}

/**
 * Return the router that hold the azure admin authentication routes
 * @param azure
 * @param configModule
 * @param id
 */
export function getAzureAdminAuthRouter(id: string, azure: AzureAuthOptions, configModule: ConfigModule): Router {
	const strategyName = `${AZURE_ADMIN_STRATEGY_NAME}_${id}`;
	return passportAuthRoutesBuilder({
		domain: 'admin',
		configModule,
		authPath: azure.admin.authPath ?? '/admin/auth/azure',
		authCallbackPath: azure.admin.authCallbackPath ?? '/admin/auth/azure/cb',
		successRedirect: azure.admin.successRedirect,
		strategyName,
		passportAuthenticateMiddlewareOptions: {
			scope: azure.admin.scope ?? [],
		},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: azure.admin.failureRedirect,
		},
		expiresIn: azure.admin.expiresIn,
	});
}

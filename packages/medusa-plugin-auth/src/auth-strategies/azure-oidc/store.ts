import { Router } from 'express';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { IOIDCStrategyOptionWithRequest, IProfile, OIDCStrategy as AzureStrategy } from 'passport-azure-ad';
import { PassportStrategy } from '../../core/passport/Strategy';
import { AZURE_STORE_STRATEGY_NAME, AzureAuthOptions, Profile, ResponseMode, ResponseType } from './types';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { validateStoreCallback } from '../../core/validate-callback';
import { AuthProvider, StrategyFactory } from '../../types';

/**
 * Return the azure store strategy
 * @param id
 */
export function getAzureStoreStrategy(id: string): StrategyFactory<AzureAuthOptions> {
	const strategyName = `${AZURE_STORE_STRATEGY_NAME}_${id}`;

	return class extends PassportStrategy(AzureStrategy, strategyName) {
		constructor(
			protected readonly container: MedusaContainer,
			protected readonly configModule: ConfigModule,
			protected readonly strategyOptions: AzureAuthOptions,
			protected readonly strict?: AuthProvider['strict']
		) {
			super({
				identityMetadata: strategyOptions.store.identityMetadata,
				clientID: strategyOptions.store.clientID,
				clientSecret: strategyOptions.store.clientSecret,
				responseType: strategyOptions.store.responseType ?? ResponseType.Code,
				responseMode: strategyOptions.store.responseMode ?? ResponseMode.Query,
				redirectUrl: strategyOptions.store.callbackUrl,
				allowHttpForRedirectUrl: strategyOptions.store.allowHttpForRedirectUrl ?? false,
				validateIssuer: strategyOptions.store.validateIssuer ?? true,
				isB2C: strategyOptions.store.isB2C ?? false,
				issuer: strategyOptions.store.issuer,
				passReqToCallback: true,
			} as IOIDCStrategyOptionWithRequest);
		}

		async validate(req: Request, profile: IProfile): Promise<null | { id: string }> {
			if (this.strategyOptions.store.verifyCallback) {
				return await this.strategyOptions.store.verifyCallback(this.container, req, profile, this.strict);
			}

			const authprofile: Profile = {
				emails: [{ value: profile?.upn }],
				name: { givenName: profile?.name?.givenName, familyName: profile?.name?.familyName },
			};

			return await validateStoreCallback(authprofile, {
				container: this.container,
				strategyErrorIdentifier: 'azure_oidc',
				strategyName,
				strict: this.strict,
			});
		}
	};
}

/**
 * Return the router that hold the azure store authentication routes
 * @param id
 * @param azure
 * @param configModule
 */
export function getAzureStoreAuthRouter(id: string, azure: AzureAuthOptions, configModule: ConfigModule): Router {
	const strategyName = `${AZURE_STORE_STRATEGY_NAME}_${id}`;
	return passportAuthRoutesBuilder({
		domain: 'store',
		configModule,
		authPath: azure.store.authPath ?? '/store/auth/azure',
		authCallbackPath: azure.store.authCallbackPath ?? '/store/auth/azure/cb',
		successRedirect: azure.store.successRedirect,
		strategyName,
		passportAuthenticateMiddlewareOptions: {
			scope: azure.store.scope ?? [],
		},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: azure.store.failureRedirect,
		},
		expiresIn: azure.store.expiresIn,
	});
}

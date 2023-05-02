import { Router } from 'express';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { OIDCStrategy as AzureStrategy } from 'passport-azure-ad';
import { PassportStrategy } from '../../core/passport/Strategy';
import { AZURE_STORE_STRATEGY_NAME, AzureAuthOptions, Profile, ResponseType, ResponseMode } from './types';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { validateStoreCallback } from '../../core/validate-callback';

export class AzureStoreStrategy extends PassportStrategy(AzureStrategy, AZURE_STORE_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: AzureAuthOptions
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
		});
	}

	async validate(
		req: Request,
		profile: any,
		done: Function
	): Promise<null | { id: string }> {
		if (this.strategyOptions.store.verifyCallback) {
			return await this.strategyOptions.store.verifyCallback(
				this.container,
				req,
				profile
			);
		}

		const authprofile: Profile = { emails: [{ value: profile.upn }], name: { givenName: profile.name.givenName, familyName: profile.name.familyName } };
		return await validateStoreCallback(authprofile, { container: this.container, strategyErrorIdentifier: 'azure_oidc' });
	}
}

/**
 * Return the router that hold the azure store authentication routes
 * @param azure
 * @param configModule
 */
export function getAzureStoreAuthRouter(azure: AzureAuthOptions, configModule: ConfigModule): Router {
	return passportAuthRoutesBuilder({
		domain: 'store',
		configModule,
		authPath: azure.store.authPath ?? '/store/auth/azure',
		authCallbackPath: azure.store.authCallbackPath ?? '/store/auth/azure/cb',
		successRedirect: azure.store.successRedirect,
		strategyName: AZURE_STORE_STRATEGY_NAME,
		passportAuthenticateMiddlewareOptions: {
			scope: [],
		},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: azure.store.failureRedirect,
		},
		expiresIn: azure.store.expiresIn,
	});
}

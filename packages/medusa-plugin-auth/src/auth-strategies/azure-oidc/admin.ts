import { OIDCStrategy as AzureStrategy } from 'passport-azure-ad';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { AZURE_ADMIN_STRATEGY_NAME, AzureAuthOptions, Profile, ResponseType, ResponseMode } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateAdminCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';

export class AzureAdminStrategy extends PassportStrategy(AzureStrategy, AZURE_ADMIN_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: AzureAuthOptions
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
		});
	}

	async validate(
		req: Request,
		profile: any,
		done: Function
	): Promise<null | { id: string }> {
		if (this.strategyOptions.admin.verifyCallback) {
			return await this.strategyOptions.admin.verifyCallback(
				this.container,
				req,
				profile
			);
		}

		const authprofile: Profile = { emails: [{ value: profile.upn }], name: { givenName: profile.name.givenName, familyName: profile.name.familyName } };
		return await validateAdminCallback(authprofile, { container: this.container, strategyErrorIdentifier: 'azure_oidc' });
	}
}

/**
 * Return the router that hold the azure admin authentication routes
 * @param azure
 * @param configModule
 */
export function getAzureAdminAuthRouter(azure: AzureAuthOptions, configModule: ConfigModule): Router {
	return passportAuthRoutesBuilder({
		domain: 'admin',
		configModule,
		authPath: azure.admin.authPath ?? '/admin/auth/azure',
		authCallbackPath: azure.admin.authCallbackPath ?? '/admin/auth/azure/cb',
		successRedirect: azure.admin.successRedirect,
		strategyName: AZURE_ADMIN_STRATEGY_NAME,
		passportAuthenticateMiddlewareOptions: {
			scope: [],
		},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: azure.admin.failureRedirect,
		},
		expiresIn: azure.admin.expiresIn,
	});
}

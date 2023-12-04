import { MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AuthProvider } from '../../types';

export const AZURE_STORE_STRATEGY_NAME = 'azure-oidc.store.medusa-auth-plugin';
export const AZURE_ADMIN_STRATEGY_NAME = 'azure-oidc.admin.medusa-auth-plugin';

export type Profile = { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } };

export enum ResponseType {
	Code = 'code',
	CodeIdToken = 'code id_token',
	IdTokenCode = 'id_token code',
	IdToken = 'id_token',
}

export enum ResponseMode {
	FormPost = 'form_post',
	Query = 'query',
}

export type AzureAuthOption = {
	/**
	 * Required
	 * 'https://login.microsoftonline.com/<tenant_name>/.well-known/openid-configuration'
	 * or equivalently: 'https://login.microsoftonline.com/<tenant_guid>/.well-known/openid-configuration'
	 *
	 * or you can use the common endpoint
	 * 'https://login.microsoftonline.com/common/.well-known/openid-configuration'
	 * To use the common endpoint, you have to either set `validateIssuer` to false, or provide the `issuer` value.
	 */
	identityMetadata: string;
	/**
	 * Required
	 * the client ID of your app in AAD
	 */
	clientID: string;
	/**
	 * Required if `responseType` is 'code', 'id_token code' or 'code id_token'.
	 * If app key contains '\', replace it with '\\'.
	 */
	clientSecret: string;
	/**
	 * Default: code
	 * As of now only code is supported as medusa-plugin-auth does not support post callbacks
	 */
	responseType?: ResponseType;
	/**
	 * Default: query
	 * As of now only query is supported as medusa-plugin-auth does not support post callbacks
	 */
	responseMode?: ResponseMode;
	/**
	 * Required if we use http for redirectUrl
	 * Not recommended unless testing on localhost
	 * Default false
	 */
	allowHttpForRedirectUrl?: boolean;
	/**
	 * Default true
	 */
	validateIssuer?: boolean;
	/**
	 * Default false
	 */
	isB2C?: boolean;
	/**
	 * Required if you want to provide the issuer(s) you want to validate instead of using the issuer from metadata
	 */
	issuer?: string;
	/**
	 * Default []
	 */
	scope?: string[];
	successRedirect: string;
	failureRedirect: string;
	/**
	 * Default /admin/auth/azure
	 */
	authPath?: string;
	/**
	 * Default /admin/auth/azure/cb
	 */
	authCallbackPath?: string;
	/**
	 * Default /admin/auth/azure/cb
	 */
	callbackUrl: string;
	/**
	 * The default verify callback function will be used if this configuration is not specified
	 */
	verifyCallback?: (
		container: MedusaContainer,
		req: Request,
		profile: any,
		strict?: AuthProvider['strict']
	) => Promise<null | { id: string } | never>;

	expiresIn?: number;
};

export type AzureAuthOptions = {
	type: 'azure_oidc';
	admin?: AzureAuthOption;
	store?: AzureAuthOption;
};

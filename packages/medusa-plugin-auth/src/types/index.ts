import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { FirebaseAuthOptions } from '../auth-strategies/firebase';
import { GoogleAuthOptions } from '../auth-strategies/google';
import { FacebookAuthOptions } from '../auth-strategies/facebook';
import { LinkedinAuthOptions } from '../auth-strategies/linkedin';
import { Auth0Options } from '../auth-strategies/auth0';
import { OAuth2AuthOptions } from '../auth-strategies/oauth2';
import { AzureAuthOptions } from '../auth-strategies/azure-oidc';

export * from './strategy';

export const CUSTOMER_METADATA_KEY = 'useSocialAuth';
export const AUTH_PROVIDER_KEY = 'authProvider';
export const EMAIL_VERIFIED_KEY = 'emailVerified';

export type StrategyExport<T extends ProviderOptions> = {
	load: (container: MedusaContainer, configModule: ConfigModule, options?: AuthProvider & T) => void;
	getRouter?: (configModule: ConfigModule, options: AuthProvider & T) => Router[];
};

/**
 * The options to set in the plugin configuration options property in the medusa-config.js file.
 */
export type AuthOptions = AuthProvider & ProviderOptions;

export type AuthOptionsWrapper =
	| AuthOptions
	| ((configModule?: ConfigModule, container?: MedusaContainer) => PromiseLike<AuthOptions>)
	| PromiseLike<AuthOptions>;

export type ProviderOptions =
	| GoogleAuthOptions
	| FacebookAuthOptions
	| LinkedinAuthOptions
	| FirebaseAuthOptions
	| Auth0Options
	| AzureAuthOptions
	| OAuth2AuthOptions;

export type StrategyErrorIdentifierType = ProviderOptions['type'];

export type AuthProvider = {
	/**
	 * The type of provider to use.
	 *
	 * @default @see StrategyErrorIdentifierType
	 */
	identifier?: string;

	/**
	 * When set to admin | store | all,  will only allow the user to authenticate using the provider
	 * that has been used to create the account on the domain that strict is set to.
	 *
	 * @default 'all'
	 */
	strict?: 'admin' | 'store' | 'all' | 'none';
};

export function handleOption(
	opt: AuthOptionsWrapper,
	configModule?: ConfigModule,
	container?: MedusaContainer
): PromiseLike<AuthOptions> {
	if (typeof opt === 'function') {
		return handleOption(opt(configModule, container), configModule, container);
	}

	if (typeof opt === 'object' && typeof (opt as any).then === 'function') {
		return opt as PromiseLike<AuthOptions>;
	}

	return Promise.resolve(opt);
}

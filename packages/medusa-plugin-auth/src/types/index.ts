import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import {
	FIREBASE_ADMIN_STRATEGY_NAME,
	FIREBASE_STORE_STRATEGY_NAME,
	FirebaseAuthOptions,
} from '../auth-strategies/firebase';
import { GOOGLE_ADMIN_STRATEGY_NAME, GOOGLE_STORE_STRATEGY_NAME, GoogleAuthOptions } from '../auth-strategies/google';
import {
	FACEBOOK_ADMIN_STRATEGY_NAME,
	FACEBOOK_STORE_STRATEGY_NAME,
	FacebookAuthOptions,
} from '../auth-strategies/facebook';
import {
	LINKEDIN_ADMIN_STRATEGY_NAME,
	LINKEDIN_STORE_STRATEGY_NAME,
	LinkedinAuthOptions,
} from '../auth-strategies/linkedin';
import { AUTH0_ADMIN_STRATEGY_NAME, AUTH0_STORE_STRATEGY_NAME, Auth0Options } from '../auth-strategies/auth0';
import { AZURE_ADMIN_STRATEGY_NAME, AZURE_STORE_STRATEGY_NAME, AzureAuthOptions } from '../auth-strategies/azure-oidc';
import { OAUTH2_ADMIN_STRATEGY_NAME, OAUTH2_STORE_STRATEGY_NAME, OAuth2AuthOptions } from '../auth-strategies/oauth2';
import { STEAM_ADMIN_STRATEGY_NAME, STEAM_STORE_STRATEGY_NAME, SteamAuthOptions } from '../auth-strategies/steam';

export const CUSTOMER_METADATA_KEY = 'useSocialAuth';
export const AUTH_PROVIDER_KEY = 'authProvider';
export const EMAIL_VERIFIED_KEY = 'emailVerified';

export const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

export type StrategyExport = {
	load: (container: MedusaContainer, configModule: ConfigModule, options?: unknown) => void;
	getRouter?: (configModule: ConfigModule, options: AuthOptions) => Router[];
};

/**
 * The options to set in the plugin configuration options property in the medusa-config.js file.
 */
export type AuthOptions = ProviderOptions & {
	/**
	 * When set to admin | store | all,  will only allow the user to authenticate using the provider
	 * that has been used to create the account on the domain that strict is set to.
	 *
	 * @default 'all'
	 */
	strict?: 'admin' | 'store' | 'all' | 'none';
};

export type ProviderOptions = {
	google?: GoogleAuthOptions;
	facebook?: FacebookAuthOptions;
	linkedin?: LinkedinAuthOptions;
	firebase?: FirebaseAuthOptions;
	auth0?: Auth0Options;
	azure_oidc?: AzureAuthOptions;
	oauth2?: OAuth2AuthOptions;
	steam?: SteamAuthOptions;
};

export type StrategyErrorIdentifierType = keyof ProviderOptions;
export type StrategyNames = {
	[key in StrategyErrorIdentifierType]: {
		admin: string;
		store: string;
	};
};

export const strategyNames: StrategyNames = {
	auth0: {
		admin: AUTH0_ADMIN_STRATEGY_NAME,
		store: AUTH0_STORE_STRATEGY_NAME,
	},
	facebook: {
		admin: FACEBOOK_ADMIN_STRATEGY_NAME,
		store: FACEBOOK_STORE_STRATEGY_NAME,
	},
	google: {
		admin: GOOGLE_ADMIN_STRATEGY_NAME,
		store: GOOGLE_STORE_STRATEGY_NAME,
	},
	linkedin: {
		admin: LINKEDIN_ADMIN_STRATEGY_NAME,
		store: LINKEDIN_STORE_STRATEGY_NAME,
	},
	firebase: {
		admin: FIREBASE_ADMIN_STRATEGY_NAME,
		store: FIREBASE_STORE_STRATEGY_NAME,
	},
	azure_oidc: {
		admin: AZURE_ADMIN_STRATEGY_NAME,
		store: AZURE_STORE_STRATEGY_NAME,
	},
	oauth2: {
		admin: OAUTH2_ADMIN_STRATEGY_NAME,
		store: OAUTH2_STORE_STRATEGY_NAME,
	},
	steam: {
		admin: STEAM_ADMIN_STRATEGY_NAME,
		store: STEAM_STORE_STRATEGY_NAME,
	},
};

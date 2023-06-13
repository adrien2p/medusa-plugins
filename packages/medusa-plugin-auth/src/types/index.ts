import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import {
	FirebaseAuthOptions,
	FIREBASE_ADMIN_STRATEGY_NAME,
	FIREBASE_STORE_STRATEGY_NAME,
} from '../auth-strategies/firebase';
import { GoogleAuthOptions, GOOGLE_ADMIN_STRATEGY_NAME, GOOGLE_STORE_STRATEGY_NAME } from '../auth-strategies/google';
import {
	FacebookAuthOptions,
	FACEBOOK_ADMIN_STRATEGY_NAME,
	FACEBOOK_STORE_STRATEGY_NAME,
} from '../auth-strategies/facebook';
import {
	LinkedinAuthOptions,
	LINKEDIN_ADMIN_STRATEGY_NAME,
	LINKEDIN_STORE_STRATEGY_NAME,
} from '../auth-strategies/linkedin';
import { Auth0Options, AUTH0_ADMIN_STRATEGY_NAME, AUTH0_STORE_STRATEGY_NAME } from '../auth-strategies/auth0';
import { AzureAuthOptions, AZURE_ADMIN_STRATEGY_NAME, AZURE_STORE_STRATEGY_NAME } from '../auth-strategies/azure-oidc';

export const CUSTOMER_METADATA_KEY = 'useSocialAuth';
export const AUTH_PROVIDER_KEY = 'authProvider';
export const EMAIL_VERIFIED_KEY = 'emailVerified';

export const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

export type StrategyExport = {
	load: (container: MedusaContainer, configModule: ConfigModule, options?: unknown) => void;
	getRouter?: (configModule: ConfigModule, options: AuthOptions) => Router[];
};

export type AuthOptions = ProviderOptions & {
	/**
	 * When no value is provided, the default is true.
	 * It means that the default behaviour will be that a user can only login with one provider.
	 * Set it to false if you want to allow a user to login with multiple providers.
	 */
	admin_strict?: boolean;
	/**
	 * When no value is provided, the default is true.
	 * It means that the default behaviour will be that a user can only login with one provider.
	 * Set it to false if you want to allow a user to login with multiple providers.
	 */
	store_strict?: boolean;
	/**
	 * It is a shortcut of the `admin_strict` and `store_strict` options. If you set
	 * this option, both domain will be set to the same value.
	 */
	strict?: boolean;
};

export type ProviderOptions = {
	google?: GoogleAuthOptions;
	facebook?: FacebookAuthOptions;
	linkedin?: LinkedinAuthOptions;
	firebase?: FirebaseAuthOptions;
	auth0?: Auth0Options;
	azure_oidc?: AzureAuthOptions;
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
};

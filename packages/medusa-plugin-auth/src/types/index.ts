import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { FirebaseAuthOptions, FIREBASE_ADMIN_STRATEGY_NAME, FIREBASE_STORE_STRATEGY_NAME } from '../auth-strategies/firebase';
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

export const CUSTOMER_METADATA_KEY = 'useSocialAuth';
export const AUTH_PROVIDER_KEY = 'authProvider';

export const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

export type StrategyExport = {
	load: (container: MedusaContainer, configModule: ConfigModule, options?: unknown) => void;
	getRouter?: (configModule: ConfigModule, options: AuthOptions) => Router[];
};

export type AuthOptions = {
	google?: GoogleAuthOptions;
	facebook?: FacebookAuthOptions;
	linkedin?: LinkedinAuthOptions;
	firebase?: FirebaseAuthOptions;
	auth0?: Auth0Options;
};

export type StrategyErrorIdentifierType = keyof AuthOptions;
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
	}
};

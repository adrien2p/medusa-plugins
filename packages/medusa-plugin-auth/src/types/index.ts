import { GoogleAuthOptions } from '../auth-strategies/google';
import { FacebookAuthOptions } from '../auth-strategies/facebook';
import { LinkedinAuthOptions } from '../auth-strategies/linkedin';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { Auth0Options } from '../auth-strategies/auth0';

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
	auth0?: Auth0Options;
};

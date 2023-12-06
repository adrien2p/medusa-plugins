import { MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AuthProvider } from '../../types';
import { Profile } from 'passport-auth0';

export const AUTH0_ADMIN_STRATEGY_NAME = 'auth0.admin.medusa-auth-plugin';
export const AUTH0_STORE_STRATEGY_NAME = 'auth0.store.medusa-auth-plugin';

export type ExtraParams = {
	audience?: string | undefined;
	connection?: string | undefined;
	prompt?: string | undefined;
};

export type Auth0Options = {
	type: 'auth0';
	clientID: string;
	clientSecret: string;
	auth0Domain: string;
	admin?: {
		callbackUrl: string;
		successRedirect: string;
		failureRedirect: string;
		/**
		 * Default /admin/auth/auth0
		 */
		authPath?: string;
		/**
		 * Default /admin/auth/auth0/cb
		 */
		authCallbackPath?: string;
		/**
		 * The default verify callback function will be used if this configuration is not specified
		 */
		verifyCallback?: (
			container: MedusaContainer,
			req: Request,
			accessToken: string,
			refreshToken: string,
			extraParams: ExtraParams,
			profile: Profile,
			strict?: AuthProvider['strict']
		) => Promise<null | { id: string } | never>;

		expiresIn?: number;
	};
	store?: {
		callbackUrl: string;
		successRedirect: string;
		failureRedirect: string;
		/**
		 * Default /store/auth/auth0
		 */
		authPath?: string;
		/**
		 * Default /store/auth/auth0/cb
		 */
		authCallbackPath?: string;
		/**
		 * The default verify callback function will be used if this configuration is not specified
		 */
		verifyCallback?: (
			container: MedusaContainer,
			req: Request,
			accessToken: string,
			refreshToken: string,
			extraParams: ExtraParams,
			profile: Profile,
			strict?: AuthProvider['strict']
		) => Promise<null | { id: string } | never>;

		expiresIn?: number;
	};
};

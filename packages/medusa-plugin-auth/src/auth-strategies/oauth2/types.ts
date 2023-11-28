import { MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AuthOptions } from '../../types';

export const OAUTH2_STORE_STRATEGY_NAME = 'oauth2.store.medusa-auth-plugin';
export const OAUTH2_ADMIN_STRATEGY_NAME = 'oauth2.admin.medusa-auth-plugin';

export type Profile = { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } };

export type OAuth2AuthOptions = {
	authorizationURL: string;
	tokenURL: string;
	clientID: string;
	clientSecret: string;
	admin?: {
		callbackUrl: string;
		successRedirect: string;
		failureRedirect: string;
		/**
		 * Default /admin/auth/oauth2
		 */
		authPath?: string;
		/**
		 * Default /admin/auth/oauth2/cb
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
			profile: Profile,
			strict?: AuthOptions['strict']
		) => Promise<null | { id: string } | never>;

		expiresIn?: number;
	};
	store?: {
		callbackUrl: string;
		successRedirect: string;
		failureRedirect: string;
		/**
		 * Default /store/auth/oauth2
		 */
		authPath?: string;
		/**
		 * Default /store/auth/oauth2/cb
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
			profile: Profile,
			strict?: AuthOptions['strict']
		) => Promise<null | { id: string } | never>;

		expiresIn?: number;
	};
	scope?: string[];
};

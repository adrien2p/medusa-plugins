import { MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AuthOptions } from '../../types';

export const STEAM_STORE_STRATEGY_NAME = 'steam.store.medusa-auth-plugin';
export const STEAM_ADMIN_STRATEGY_NAME = 'steam.admin.medusa-auth-plugin';

export type Profile = { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } };

export type SteamAuthOptions = {
	realm: string;
	apiKey: string;
	admin?: {
		callbackUrl: string;
		successRedirect: string;
		failureRedirect: string;
		/**
		 * Default /admin/auth/steam
		 */
		authPath?: string;
		/**
		 * Default /admin/auth/steam/cb
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
		 * Default /store/auth/steam
		 */
		authPath?: string;
		/**
		 * Default /store/auth/steam/cb
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
};

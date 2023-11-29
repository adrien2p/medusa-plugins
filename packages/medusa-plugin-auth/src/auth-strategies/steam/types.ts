import { MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AuthOptions } from '../../types';

export const STEAM_STORE_STRATEGY_NAME = 'steam.store.medusa-auth-plugin';
export const STEAM_ADMIN_STRATEGY_NAME = 'steam.admin.medusa-auth-plugin';

/**
 * The profile returned from the steam strategy
 *
 * @see https://github.com/liamcurry/passport-steam/blob/master/lib/passport-steam/strategy.js#L30
 *
 * @param provider - The provider name
 * @param id - The steam id
 * @param _json - The raw json returned from steam
 * @param displayName - The display name of the user
 * @param photos - The photos of the user
 */
export type Profile = {
	provider: 'steam';
	id: string;
	_json: any,
	displayName?: string;
	photos?: { value: string }[];
};

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
			identifier: string,
			profile: Profile,
			strict?: AuthOptions['strict'],
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
			identifier: string,
			profile: Profile,
			strict?: AuthOptions['strict'],
		) => Promise<null | { id: string } | never>;

		expiresIn?: number;
	};
};

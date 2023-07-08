import { MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AuthOptions } from '../../types';

export const SUPABASE_AUTH_ADMIN_STRATEGY_NAME = 'supabase-auth.admin.medusa-auth-plugin';
export const SUPABASE_AUTH_STORE_STRATEGY_NAME = 'supabase-auth.store.medusa-auth-plugin';

export type Profile = { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } };
export type ExtraParams = {
	audience?: string | undefined;
	connection?: string | undefined;
	prompt?: string | undefined;
};

export type SupabaseAuthOptions = {
	supabaseUrl: string;
	supabaseKey: string;
	admin?: {
		callbackUrl: string;
		successRedirect: string;
		failureRedirect: string;
		/**
		 * Default /admin/auth/supabase-auth
		 */
		authPath?: string;
		/**
		 * Default /admin/auth/supabase-auth/cb
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
			strict?: AuthOptions['strict']
		) => Promise<null | { id: string } | never>;

		expiresIn?: number;
	};
	store?: {
		callbackUrl: string;
		successRedirect: string;
		failureRedirect: string;
		/**
		 * Default /store/auth/supabase-auth
		 */
		authPath?: string;
		/**
		 * Default /store/auth/supabase-auth/cb
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
			strict?: AuthOptions['strict']
		) => Promise<null | { id: string } | never>;

		expiresIn?: number;
	};
};

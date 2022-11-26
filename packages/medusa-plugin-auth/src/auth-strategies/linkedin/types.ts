import { MedusaContainer } from '@medusajs/medusa/dist/types/global';

export const LINKEDIN_ADMIN_STRATEGY_NAME = 'linkedin.admin.medusa-auth-plugin';
export const LINKEDIN_STORE_STRATEGY_NAME = 'linkedin.store.medusa-auth-plugin';

export type Profile = { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } };

export type LinkedinAuthOptions = {
	clientID: string;
	clientSecret: string;
	admin?: {
		callbackUrl: string;
		successRedirect: string;
		failureRedirect: string;
		/**
		 * Default /admin/auth/linkedin
		 */
		authPath?: string;
		/**
		 * Default /admin/auth/linkedin/cb
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
			profile: Profile
		) => Promise<null | { id: string } | never>;

		expiresIn?: number;
	};
	store?: {
		callbackUrl: string;
		successRedirect: string;
		failureRedirect: string;
		/**
		 * Default /store/auth/linkedin
		 */
		authPath?: string;
		/**
		 * Default /store/auth/linkedin/cb
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
			profile: Profile
		) => Promise<null | { id: string } | never>;

		expiresIn?: number;
	};
};

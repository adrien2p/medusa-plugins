import { MedusaContainer } from '@medusajs/medusa/dist/types/global';

export const KEYCLOAK_ADMIN_STRATEGY_NAME = 'keycloak.admin.medusa-auth-plugin';
export const KEYCLOAK_STORE_STRATEGY_NAME = 'keycloak.store.medusa-auth-plugin';

export type Profile = { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } };
export type ExtraParams = {
	audience?: string | undefined;
	connection?: string | undefined;
	prompt?: string | undefined;
};

export type KeycloakOptions = {
	authorizationURL: string;
	tokenURL: string;
	clientID: string;
	clientSecret: string;
	admin?: {
		callbackUrl: string;
		successRedirect: string;
		failureRedirect: string;
		/**
		 * Default /admin/auth/keycloak
		 */
		authPath?: string;
		/**
		 * Default /admin/auth/keycloak/cb
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
			profile: Profile
		) => Promise<null | { id: string } | never>;

		expiresIn?: number;
	};
	store?: {
		callbackUrl: string;
		successRedirect: string;
		failureRedirect: string;
		/**
		 * Default /store/auth/keycloak
		 */
		authPath?: string;
		/**
		 * Default /store/auth/keycloak/keycloak
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
			profile: Profile
		) => Promise<null | { id: string } | never>;

		expiresIn?: number;
	};
};

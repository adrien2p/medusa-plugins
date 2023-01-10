export const FIREBASE_STORE_STRATEGY_NAME = 'firebase.store.medusa-auth-plugin';
export const FIREBASE_ADMIN_STRATEGY_NAME = 'firebase.admin.medusa-auth-plugin';

export type Profile = { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } };

export type FirebaseAuthOptions = {
	credentialJsonPath: string;
	admin?: {
		successRedirect: string;
		failureRedirect: string;
		/**
		 * Default true
		 */
		enableRedirects?: boolean;
		/**
		 * Default /admin/auth/firebase
		 */
		authPath?: string;
		/**
		 * If not specified, Jwt will be extracted from Authorization header.
		 */
		jwtFromRequest?: (req: any) => string;


		expiresIn?: number;
	};
	store?: {
		successRedirect: string;
		failureRedirect: string;
		/**
		 * Default true
		 */
		enableRedirects?: boolean;
		/**
		 * Default /store/auth/firebase
		 */
		authPath?: string;
		/**
		 * If not specified, Jwt will be extracted from Authorization header.
		 */
		jwtFromRequest?: (req: any) => string;
		
		expiresIn?: number;
	};
};

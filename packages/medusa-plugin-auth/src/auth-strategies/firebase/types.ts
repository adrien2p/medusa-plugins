import { MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AuthProvider } from '../../types';

export const FIREBASE_STORE_STRATEGY_NAME = 'firebase.store.medusa-auth-plugin';
export const FIREBASE_ADMIN_STRATEGY_NAME = 'firebase.admin.medusa-auth-plugin';

export type Profile = { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } };

export type FirebaseAuthOptions = {
	type: 'firebase';
	credentialJsonPath: string;
	admin?: {
		/**
		 * Default /admin/auth/firebase
		 */
		authPath?: string;
		/**
		 * If not specified, Jwt will be extracted from Authorization header.
		 */
		jwtFromRequest?: (req: any) => string;
		/**
		 * The default verify callback function will be used if this configuration is not specified
		 */
		verifyCallback?: (
			container: MedusaContainer,
			decodedToken: any,
			strict?: AuthProvider['strict']
		) => Promise<null | { id: string } | never>;

		expiresIn?: number;
	};
	store?: {
		/**
		 * Default /store/auth/firebase
		 */
		authPath?: string;
		/**
		 * If not specified, Jwt will be extracted from Authorization header.
		 */
		jwtFromRequest?: (req: any) => string;
		/**
		 * The default verify callback function will be used if this configuration is not specified
		 */
		verifyCallback?: (
			container: MedusaContainer,
			decodedToken: any,
			strict?: AuthProvider['strict']
		) => Promise<null | { id: string } | never>;

		expiresIn?: number;
	};
};

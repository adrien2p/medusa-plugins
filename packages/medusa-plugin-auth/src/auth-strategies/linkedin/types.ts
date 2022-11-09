import { MedusaContainer } from '@medusajs/medusa/dist/types/global';

export type LinkedinAuthOptions = {
	clientID: string;
	clientSecret: string;
	admin?: {
		callbackUrl: string;
		successRedirect: string;
		failureRedirect: string;
		authPath: string;
		authCallbackPath: string;
		/**
		 * The default verify callback function will be used if this configuration is not specified
		 */
		verifyCallback?: (
			container: MedusaContainer,
			req: Request,
			accessToken: string,
			refreshToken: string,
			profile: { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } },
			done: (err: null | unknown, data: null | { id: string }) => void
		) => Promise<void>;

		expiresIn?: string;
	};
	store?: {
		callbackUrl: string;
		successRedirect: string;
		failureRedirect: string;
		authPath: string;
		authCallbackPath: string;
		/**
		 * The default verify callback function will be used if this configuration is not specified
		 */
		verifyCallback?: (
			container: MedusaContainer,
			req: Request,
			accessToken: string,
			refreshToken: string,
			profile: { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } },
			done: (err: null | unknown, data: null | { id: string }) => void
		) => Promise<void>;

		expiresIn?: string;
	};
};

export const AUTH_TOKEN_COOKIE_NAME = 'auth_token';

export type AuthOptions = {
	google?: {
		clientID: string;
		clientSecret: string;
		admin?: {
			callbackUrl: string;
			successRedirect: string;
			failureRedirect: string;
			authPath: string;
			authCallbackPath: string;

			expiresIn?: string;
		};
		store?: {
			callbackUrl: string;
			successRedirect: string;
			failureRedirect: string;
			authPath: string;
			authCallbackPath: string;

			expiresIn?: string;
		};
	};
};

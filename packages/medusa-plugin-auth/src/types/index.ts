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

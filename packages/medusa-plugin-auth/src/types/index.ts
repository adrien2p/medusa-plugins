import { GoogleAuthOptions } from '../auth-strategies/google';
import { FacebookAuthOptions } from '../auth-strategies/facebook';
import { TwitterAuthOptions } from '../auth-strategies/twitter';
import { LinkedinAuthOptions } from '../auth-strategies/linkedin';

export const STORE_AUTH_TOKEN_COOKIE_NAME = 'store_auth_token';
export const ADMIN_AUTH_TOKEN_COOKIE_NAME = 'admin_auth_token';

export const CUSTOMER_METADATA_KEY = 'useSocialAuth';

export const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

export type AuthOptions = {
	google?: GoogleAuthOptions;
	facebook?: FacebookAuthOptions;
	twitter?: TwitterAuthOptions;
	linkedin?: LinkedinAuthOptions;
};

import { GoogleAuthOptions } from '../auth-strategies/google';
import { FacebookAuthOptions } from '../auth-strategies/facebook';
import { TwitterAuthOptions } from '../auth-strategies/twitter';

export const AUTH_TOKEN_COOKIE_NAME = 'auth_token';

export const CUSTOMER_METADATA_KEY = 'useSocialAuth';

export const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

export type AuthOptions = {
	google?: GoogleAuthOptions;
	facebook?: FacebookAuthOptions;
	twitter?: TwitterAuthOptions;
};

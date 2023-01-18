import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';

import { AuthOptions } from '../types';
import GoogleStrategy from '../auth-strategies/google';
import FacebookStrategy from '../auth-strategies/facebook';
import LinkedinStrategy from '../auth-strategies/linkedin';
import FireaseStrategy from '../auth-strategies/firebase';
import Auth0Strategy from '../auth-strategies/auth0';

export default async function authStrategiesLoader(container: MedusaContainer, authOptions: AuthOptions) {
	const configModule = container.resolve('configModule') as ConfigModule;

	GoogleStrategy.load(container, configModule, authOptions);
	FacebookStrategy.load(container, configModule, authOptions);
	LinkedinStrategy.load(container, configModule, authOptions);
	FireaseStrategy.load(container, configModule, authOptions);
	Auth0Strategy.load(container, configModule, authOptions);
}

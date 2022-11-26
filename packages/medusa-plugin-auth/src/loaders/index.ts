import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';

import { AuthOptions } from '../types';
import JwtStrategy from '../auth-strategies/jwt';
import GoogleStrategy from '../auth-strategies/google';
import FacebookStrategy from '../auth-strategies/facebook';
import LinkedinStrategy from '../auth-strategies/linkedin';

export default async function authStrategiesLoader(container: MedusaContainer, authOptions: AuthOptions) {
	const configModule = container.resolve('configModule') as ConfigModule;

	JwtStrategy.load(container, configModule);
	GoogleStrategy.load(container, configModule, authOptions);
	FacebookStrategy.load(container, configModule, authOptions);
	LinkedinStrategy.load(container, configModule, authOptions);
}

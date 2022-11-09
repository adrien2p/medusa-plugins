import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';

import { AuthOptions } from '../types';
import { loadGoogleStrategies } from '../auth-strategies/google';
import { loadFacebookStrategies } from '../auth-strategies/facebook';
import { loadTwitterStrategies } from '../auth-strategies/twitter';

export default async function authStrategiesLoader(container: MedusaContainer, authOptions: AuthOptions) {
	const configModule = container.resolve('configModule') as ConfigModule;

	loadGoogleStrategies(container, configModule, authOptions);
	loadFacebookStrategies(container, configModule, authOptions);
	loadTwitterStrategies(container, configModule, authOptions);
}

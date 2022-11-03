import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { loadGoogleAdminStrategy, loadGoogleStoreStrategy } from '../auth-strategies/google';

import { AuthOptions } from '../types';

export default async function authStrategiesLoader(container: MedusaContainer, authOptions: AuthOptions) {
	const configModule = container.resolve('configModule') as ConfigModule;

	const { google } = authOptions;

	if (google) {
		if (google.admin) {
			await loadGoogleAdminStrategy(container, configModule, google);
		}
		if (google.store) {
			await loadGoogleStoreStrategy(container, configModule, google);
		}
	}
}

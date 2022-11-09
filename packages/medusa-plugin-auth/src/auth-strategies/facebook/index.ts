import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AuthOptions } from '../../types';
import { Router } from 'express';
import { getFacebookAdminAuthRouter, loadFacebookAdminStrategy } from './admin';
import { getFacebookStoreAuthRouter, loadFacebookStoreStrategy } from './store';

export const ENTITY_METADATA_KEY = 'useFacebookStrategy';

export * from './admin';
export * from './store';
export * from './types';

export function getFacebookRoutes(configModule: ConfigModule, options: AuthOptions): Router[] {
	const routers = [];

	if (options.facebook?.admin) {
		routers.push(getFacebookAdminAuthRouter(options.facebook, configModule));
	}

	if (options.facebook?.store) {
		routers.push(getFacebookStoreAuthRouter(options.facebook, configModule));
	}

	return routers;
}

export function loadFacebookStrategies(
	container: MedusaContainer,
	configModule: ConfigModule,
	options: AuthOptions
): void {
	if (options.facebook?.admin) {
		loadFacebookAdminStrategy(container, configModule, options.facebook);
	}

	if (options.facebook?.store) {
		loadFacebookStoreStrategy(container, configModule, options.facebook);
	}
}

import { AuthOptions } from '../../types';
import { Router } from 'express';
import { getGoogleAdminAuthRouter, loadGoogleAdminStrategy } from './admin';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { getGoogleStoreAuthRouter, loadGoogleStoreStrategy } from './store';

export const ENTITY_METADATA_KEY = 'useGoogleStrategy';

export * from './types';
export * from './admin';
export * from './store';

export function getGoogleRoutes(configModule: ConfigModule, options: AuthOptions): Router[] {
	const routers = [];

	if (options.google?.admin) {
		routers.push(getGoogleAdminAuthRouter(options.google, configModule));
	}

	if (options.google?.store) {
		routers.push(getGoogleStoreAuthRouter(options.google, configModule));
	}

	return routers;
}

export function loadGoogleStrategies(
	container: MedusaContainer,
	configModule: ConfigModule,
	options: AuthOptions
): void {
	if (options.google?.admin) {
		loadGoogleAdminStrategy(container, configModule, options.google);
	}

	if (options.google?.store) {
		loadGoogleStoreStrategy(container, configModule, options.google);
	}
}

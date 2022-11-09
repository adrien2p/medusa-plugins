import { AuthOptions } from '../../types';
import { Router } from 'express';
import { getTwitterAdminAuthRouter, loadTwitterAdminStrategy } from './admin';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { getTwitterStoreAuthRouter, loadTwitterStoreStrategy } from './store';

export * from './types';
export * from './admin';
export * from './store';

export function getTwitterRoutes(configModule: ConfigModule, options: AuthOptions): Router[] {
	const routers = [];

	if (options.twitter?.admin) {
		routers.push(getTwitterAdminAuthRouter(options.twitter, configModule));
	}

	if (options.twitter?.store) {
		routers.push(getTwitterStoreAuthRouter(options.twitter, configModule));
	}

	return routers;
}

export function loadTwitterStrategies(
	container: MedusaContainer,
	configModule: ConfigModule,
	options: AuthOptions
): void {
	if (options.twitter?.admin) {
		loadTwitterAdminStrategy(container, configModule, options.twitter);
	}

	if (options.twitter?.store) {
		loadTwitterStoreStrategy(container, configModule, options.twitter);
	}
}

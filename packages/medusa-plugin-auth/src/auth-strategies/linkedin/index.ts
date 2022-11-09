import { AuthOptions } from '../../types';
import { Router } from 'express';
import { getLinkedinAdminAuthRouter, loadLinkedinAdminStrategy } from './admin';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { getLinkedinStoreAuthRouter, loadLinkedinStoreStrategy } from './store';

export * from './types';
export * from './admin';
export * from './store';

export function getLinkedinRoutes(configModule: ConfigModule, options: AuthOptions): Router[] {
	const routers = [];

	if (options.linkedin?.admin) {
		routers.push(getLinkedinAdminAuthRouter(options.linkedin, configModule));
	}

	if (options.linkedin?.store) {
		routers.push(getLinkedinStoreAuthRouter(options.linkedin, configModule));
	}

	return routers;
}

export function loadLinkedinStrategies(
	container: MedusaContainer,
	configModule: ConfigModule,
	options: AuthOptions
): void {
	if (options.linkedin?.admin) {
		loadLinkedinAdminStrategy(container, configModule, options.linkedin);
	}

	if (options.linkedin?.store) {
		loadLinkedinStoreStrategy(container, configModule, options.linkedin);
	}
}

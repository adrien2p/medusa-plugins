import { AuthOptions, StrategyExport } from '../../types';
import { Router } from 'express';
import { getGoogleAdminAuthRouter, GoogleAdminStrategy } from './admin';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { getGoogleStoreAuthRouter, GoogleStoreStrategy } from './store';

export * from './types';
export * from './admin';
export * from './store';

export default {
	load: (container: MedusaContainer, configModule: ConfigModule, options: AuthOptions): void => {
		if (options.google?.admin) {
			new GoogleAdminStrategy(container, configModule, options.google);
		}

		if (options.google?.store) {
			new GoogleStoreStrategy(container, configModule, options.google);
		}
	},
	getRouter: (configModule: ConfigModule, options: AuthOptions): Router[] => {
		const routers = [];

		if (options.google?.admin) {
			routers.push(getGoogleAdminAuthRouter(options.google, configModule));
		}

		if (options.google?.store) {
			routers.push(getGoogleStoreAuthRouter(options.google, configModule));
		}

		return routers;
	},
} as StrategyExport;

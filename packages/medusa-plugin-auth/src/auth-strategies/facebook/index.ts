import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AuthOptions, StrategyExport } from '../../types';
import { Router } from 'express';
import { FacebookAdminStrategy, getFacebookAdminAuthRouter } from './admin';
import { FacebookStoreStrategy, getFacebookStoreAuthRouter } from './store';

export * from './admin';
export * from './store';
export * from './types';

export default {
	load: (container: MedusaContainer, configModule: ConfigModule, options: AuthOptions): void => {
		if (options.facebook?.admin) {
			new FacebookAdminStrategy(container, configModule, options.facebook);
		}

		if (options.facebook?.store) {
			new FacebookStoreStrategy(container, configModule, options.facebook);
		}
	},
	getRouter: (configModule: ConfigModule, options: AuthOptions): Router[] => {
		const routers = [];

		if (options.facebook?.admin) {
			routers.push(getFacebookAdminAuthRouter(options.facebook, configModule));
		}

		if (options.facebook?.store) {
			routers.push(getFacebookStoreAuthRouter(options.facebook, configModule));
		}

		return routers;
	},
} as StrategyExport;

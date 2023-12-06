import { StrategyExport } from '../../types';
import { Router } from 'express';
import { getFacebookAdminAuthRouter, getFacebookAdminStrategy } from './admin';
import { getFacebookStoreAuthRouter, getFacebookStoreStrategy } from './store';
import { FacebookAuthOptions } from './types';

export * from './admin';
export * from './store';
export * from './types';

export default {
	load: (container, configModule, options): void => {
		const id = options.identifier ?? options.type;
		if (options.admin) {
			const FacebookAdminStrategy = getFacebookAdminStrategy(id);
			new FacebookAdminStrategy(container, configModule, options, options.strict);
		}

		if (options.store) {
			const FacebookStoreStrategy = getFacebookStoreStrategy(id);
			new FacebookStoreStrategy(container, configModule, options, options.strict);
		}
	},
	getRouter: (configModule, options): Router[] => {
		const id = options.identifier ?? options.type;
		const routers = [];

		if (options.admin) {
			routers.push(getFacebookAdminAuthRouter(id, options, configModule));
		}

		if (options.store) {
			routers.push(getFacebookStoreAuthRouter(id, options, configModule));
		}

		return routers;
	},
} as StrategyExport<FacebookAuthOptions>;

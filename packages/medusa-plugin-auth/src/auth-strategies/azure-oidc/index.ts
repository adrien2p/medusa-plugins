import { StrategyExport } from '../../types';
import { Router } from 'express';
import { getAzureAdminAuthRouter, getAzureAdminStrategy } from './admin';
import { getAzureStoreAuthRouter, getAzureStoreStrategy } from './store';
import { AzureAuthOptions } from './types';

export * from './types';
export * from './admin';
export * from './store';

export default {
	load: (container, configModule, option): void => {
		const id = option.identifier ?? option.type;
		if (option?.admin) {
			const Clazz = getAzureAdminStrategy(id);
			new Clazz(container, configModule, option, option.strict);
		}

		if (option?.store) {
			const Clazz = getAzureStoreStrategy(id);
			new Clazz(container, configModule, option, option.strict);
		}
	},
	getRouter: (configModule, option) => {
		const id = option.identifier ?? option.type;
		const routers: Router[] = [];

		if (option?.admin) {
			routers.push(getAzureAdminAuthRouter(id, option, configModule));
		}

		if (option?.store) {
			routers.push(getAzureStoreAuthRouter(id, option, configModule));
		}

		return routers;
	},
} as StrategyExport<AzureAuthOptions>;

import { StrategyExport } from '../../types';
import { Router } from 'express';
import { getAuth0AdminAuthRouter, getAuth0AdminStrategy } from './admin';
import { getAuth0StoreAuthRouter, getAuth0StoreStrategy } from './store';
import { Auth0Options } from './types';

export * from './admin';
export * from './store';
export * from './types';

export default {
	load: (container, configModule, option): void => {
		const id = option.identifier ?? option.type;
		if (option.admin) {
			const Clazz = getAuth0AdminStrategy(id);
			new Clazz(container, configModule, option, option.strict);
		}

		if (option.store) {
			const Clazz = getAuth0StoreStrategy(id);
			new Clazz(container, configModule, option, option.strict);
		}
	},
	getRouter: (configModule, option): Router[] => {
		const routers = [];
		const id = option.identifier ?? option.type;

		if (option.admin) {
			routers.push(getAuth0AdminAuthRouter(id, option, configModule));
		}

		if (option.store) {
			routers.push(getAuth0StoreAuthRouter(id, option, configModule));
		}

		return routers;
	},
} as StrategyExport<Auth0Options>;

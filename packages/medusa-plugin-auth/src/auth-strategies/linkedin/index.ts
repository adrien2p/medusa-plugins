import { StrategyExport } from '../../types';
import { Router } from 'express';
import {
	getLinkedinAdminAuthRouter,
	getLinkedinAdminStrategy,
	getLinkedinStoreAuthRouter,
	getLinkedinStoreStrategy,
	LinkedinAuthOptions,
} from '../linkedin';

export * from './types';
export * from './admin';
export * from './store';

export default {
	load: (container, configModule, options): void => {
		const id = options.identifier ?? options.type;
		if (options.admin) {
			const Clazz = getLinkedinAdminStrategy(id);
			new Clazz(container, configModule, options, options.strict);
		}

		if (options.store) {
			const Clazz = getLinkedinStoreStrategy(id);
			new Clazz(container, configModule, options, options.strict);
		}
	},
	getRouter: (configModule, options): Router[] => {
		const id = options.identifier ?? options.type;
		const routers = [];

		if (options.admin) {
			routers.push(getLinkedinAdminAuthRouter(id, options, configModule));
		}

		if (options.store) {
			routers.push(getLinkedinStoreAuthRouter(id, options, configModule));
		}

		return routers;
	},
} as StrategyExport<LinkedinAuthOptions>;

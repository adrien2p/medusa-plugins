import { StrategyExport } from '../../types';
import { Router } from 'express';
import { getOAuth2AdminAuthRouter, getOAuth2AdminStrategy } from './admin';
import { getOAuth2StoreAuthRouter, getOAuth2StoreStrategy } from './store';
import { OAuth2AuthOptions } from './types';

export * from './types';
export * from './admin';
export * from './store';

export default {
	load: (container, configModule, options): void => {
		const id = options.identifier ?? options.type;
		if (options.admin) {
			const Clazz = getOAuth2AdminStrategy(id);
			new Clazz(container, configModule, options, options.strict);
		}

		if (options.store) {
			const Clazz = getOAuth2StoreStrategy(id);
			new Clazz(container, configModule, options, options.strict);
		}
	},
	getRouter: (configModule, options): Router[] => {
		const id = options.identifier ?? options.type;
		const routers = [];

		if (options.admin) {
			routers.push(getOAuth2AdminAuthRouter(id, options, configModule));
		}

		if (options.store) {
			routers.push(getOAuth2StoreAuthRouter(id, options, configModule));
		}

		return routers;
	},
} as StrategyExport<OAuth2AuthOptions>;

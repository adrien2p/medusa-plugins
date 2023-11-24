import { AuthOptions, StrategyExport } from '../../types';
import { Router } from 'express';
import { getOAuth2AdminAuthRouter, OAuth2AdminStrategy } from './admin';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { getOAuth2StoreAuthRouter, OAuth2StoreStrategy } from './store';

export * from './types';
export * from './admin';
export * from './store';

export default {
	load: (container: MedusaContainer, configModule: ConfigModule, options: AuthOptions): void => {
		if (options.oauth2?.admin) {
			new OAuth2AdminStrategy(container, configModule, options.oauth2, options.strict);
		}

		if (options.oauth2?.store) {
			new OAuth2StoreStrategy(container, configModule, options.oauth2, options.strict);
		}
	},
	getRouter: (configModule: ConfigModule, options: AuthOptions): Router[] => {
		const routers = [];

		if (options.oauth2?.admin) {
			routers.push(getOAuth2AdminAuthRouter(options.oauth2, configModule));
		}

		if (options.oauth2?.store) {
			routers.push(getOAuth2StoreAuthRouter(options.oauth2, configModule));
		}

		return routers;
	},
} as StrategyExport;

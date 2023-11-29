import { AuthOptions, StrategyExport } from '../../types';
import { Router } from 'express';
import { getSteamAdminAuthRouter, SteamAdminStrategy } from './admin';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { getSteamStoreAuthRouter, SteamStoreStrategy } from './store';

export * from './types';
export * from './admin';
export * from './store';

export default {
	load: (container: MedusaContainer, configModule: ConfigModule, options: AuthOptions): void => {
		if (options.steam?.admin) {
			new SteamAdminStrategy(container, configModule, options.steam, options.strict);
		}

		if (options.steam?.store) {
			new SteamStoreStrategy(container, configModule, options.steam, options.strict);
		}
	},
	getRouter: (configModule: ConfigModule, options: AuthOptions): Router[] => {
		const routers = [];

		if (options.steam?.admin) {
			routers.push(getSteamAdminAuthRouter(options.steam, configModule));
		}

		if (options.steam?.store) {
			routers.push(getSteamStoreAuthRouter(options.steam, configModule));
		}

		return routers;
	},
} as StrategyExport;

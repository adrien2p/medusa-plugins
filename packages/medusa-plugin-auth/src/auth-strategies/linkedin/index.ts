import { AuthOptions, StrategyExport } from '../../types';
import { Router } from 'express';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import {
	getLinkedinAdminAuthRouter,
	getLinkedinStoreAuthRouter,
	LinkedinAdminStrategy,
	LinkedinStoreStrategy,
} from '../linkedin';

export * from './types';
export * from './admin';
export * from './store';

export default {
	load: (container: MedusaContainer, configModule: ConfigModule, options: AuthOptions): void => {
		if (options.linkedin?.admin) {
			new LinkedinAdminStrategy(container, configModule, options.linkedin, {
				admin_strict: options.admin_strict,
				strict: options.strict,
			});
		}

		if (options.linkedin?.store) {
			new LinkedinStoreStrategy(container, configModule, options.linkedin, {
				store_strict: options.store_strict,
				strict: options.strict,
			});
		}
	},
	getRouter: (configModule: ConfigModule, options: AuthOptions): Router[] => {
		const routers = [];

		if (options.linkedin?.admin) {
			routers.push(getLinkedinAdminAuthRouter(options.linkedin, configModule));
		}

		if (options.linkedin?.store) {
			routers.push(getLinkedinStoreAuthRouter(options.linkedin, configModule));
		}

		return routers;
	},
} as StrategyExport;

import { AuthOptions, StrategyExport } from '../../types';
import { Router } from 'express';
import { getAzureAdminAuthRouter, AzureAdminStrategy } from './admin';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { getAzureStoreAuthRouter, AzureStoreStrategy } from './store';

export * from './types';
export * from './admin';
export * from './store';

export default {
	load: (container: MedusaContainer, configModule: ConfigModule, options: AuthOptions): void => {
		if (options.azure_oidc?.admin) {
			new AzureAdminStrategy(container, configModule, options.azure_oidc,{
				admin_strict: options.admin_strict,
				strict: options.strict,
			});
		}

		if (options.azure_oidc?.store) {
			new AzureStoreStrategy(container, configModule, options.azure_oidc, {
				store_strict: options.store_strict,
				strict: options.strict,
			});
		}
	},
	getRouter: (configModule: ConfigModule, options: AuthOptions): Router[] => {
		const routers = [];

		if (options.azure_oidc?.admin) {
			routers.push(getAzureAdminAuthRouter(options.azure_oidc, configModule));
		}

		if (options.azure_oidc?.store) {
			routers.push(getAzureStoreAuthRouter(options.azure_oidc, configModule));
		}

		return routers;
	},
} as StrategyExport;

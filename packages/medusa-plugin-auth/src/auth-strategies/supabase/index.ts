import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AuthOptions, StrategyExport } from '../../types';
import { Router } from 'express';
import { getSupabaseAdminAuthRouter, SupabaseAdminStrategy } from './admin';
import { getSupabaseStoreAuthRouter, SupabaseStrategy } from './store';

export * from './admin';
export * from './store';
export * from './types';

export default {
	load: (container: MedusaContainer, configModule: ConfigModule, options: AuthOptions): void => {
		if (options.supabase?.admin) {
			new SupabaseStrategy(container, configModule, options.supabase, options.strict);
		}

		if (options.supabase?.store) {
			new SupabaseStrategy(container, configModule, options.supabase, options.strict);
		}
	},
	getRouter: (configModule: ConfigModule, options: AuthOptions): Router[] => {
		const routers = [];

		if (options.supabase?.admin) {
			routers.push(getSupabaseAdminAuthRouter(options.supabase, configModule));
		}

		if (options.supabase?.store) {
			routers.push(getSupabaseStoreAuthRouter(options.supabase, configModule));
		}

		return routers;
	},
} as StrategyExport;

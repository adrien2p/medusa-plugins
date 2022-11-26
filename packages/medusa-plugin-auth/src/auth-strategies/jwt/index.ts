import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { StrategyExport } from '../../types';
import { JwtAdminStrategy } from './admin';
import { JwtStoreStrategy } from './store';

export default {
	load: (container: MedusaContainer, configModule: ConfigModule): void => {
		new JwtAdminStrategy(container, configModule);
		new JwtStoreStrategy(container, configModule);
	},
} as StrategyExport;

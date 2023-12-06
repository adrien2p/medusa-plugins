import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AuthProvider } from './index';

export interface IStrategy {
	validate(...args: any[]): any;
}

export type StrategyFactory<T> = new (
	container: MedusaContainer,
	configModule: ConfigModule,
	strategyOptions: T,
	strict?: AuthProvider['strict']
) => IStrategy;

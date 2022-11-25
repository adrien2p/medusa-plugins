import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AuthOptions } from '../../types';
import { Router } from 'express';
import { getAuth0AdminAuthRouter, loadAuth0AdminStrategy } from './admin';
import { getAuth0StoreAuthRouter, loadAuth0StoreStrategy } from './store';

export * from './admin'
export * from './store'
export * from './types'

export function getAuth0Routes(configModule: ConfigModule, options: AuthOptions): Router[] {
  const routers = [];

  if (options.auth0?.admin) {
    routers.push(getAuth0AdminAuthRouter(options.auth0, configModule));
  }

  if (options.auth0?.store) {
    routers.push(getAuth0StoreAuthRouter(options.auth0, configModule));
  }

  return routers;
}

export function loadAuth0Strategies(
  container: MedusaContainer,
  configModule: ConfigModule,
  options: AuthOptions
): void {
  if (options.auth0?.admin) {
    loadAuth0AdminStrategy(container, configModule, options.auth0);
  }

  if (options.auth0?.store) {
    loadAuth0StoreStrategy(container, configModule, options.auth0);
  }
}
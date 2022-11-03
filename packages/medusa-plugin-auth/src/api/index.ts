import { Router } from 'express';
import { ConfigModule } from '@medusajs/medusa/dist/types/global';
import loadConfig from '@medusajs/medusa/dist/loaders/config';

import { AuthOptions } from '../types';
import { getGoogleAdminAuthRouter, getGoogleStoreAuthRouter } from '../auth-strategies/google';
import { loadJwtOverrideStrategy } from "../auth-strategies/jwt-override";

export default function (rootDirectory, pluginOptions: AuthOptions): Router[] {
	const configModule = loadConfig(rootDirectory) as ConfigModule;

	loadJwtOverrideStrategy(configModule)

	return loadRouters(configModule, pluginOptions);
}

function loadRouters(configModule: ConfigModule, options: AuthOptions): Router[] {
	const routers: Router[] = [];

	const { google } = options;

	if (google) {
		if (google.admin) {
			const router = getGoogleAdminAuthRouter(google, configModule);
			routers.push(router);
		}
		if (google.store) {
			const router = getGoogleStoreAuthRouter(google, configModule);
			routers.push(router);
		}
	}

	return routers;
}

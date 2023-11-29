import { Router } from 'express';
import { ConfigModule } from '@medusajs/medusa/dist/types/global';
import loadConfig from '@medusajs/medusa/dist/loaders/config';
import OAuth2Strategy from '../auth-strategies/oauth2';
import GoogleStrategy from '../auth-strategies/google';
import FacebookStrategy from '../auth-strategies/facebook';
import LinkedinStrategy from '../auth-strategies/linkedin';
import FirebaseStrategy from '../auth-strategies/firebase';
import Auth0Strategy from '../auth-strategies/auth0';
import AzureStrategy from '../auth-strategies/azure-oidc';
import SteamStrategy from '../auth-strategies/steam';

import { AuthOptions } from '../types';

export default function (rootDirectory, pluginOptions: AuthOptions): Router[] {
	const configModule = loadConfig(rootDirectory) as ConfigModule;
	return loadRouters(configModule, pluginOptions);
}

function loadRouters(configModule: ConfigModule, options: AuthOptions): Router[] {
	const routers: Router[] = [];

	routers.push(...OAuth2Strategy.getRouter(configModule, options));
	routers.push(...GoogleStrategy.getRouter(configModule, options));
	routers.push(...FacebookStrategy.getRouter(configModule, options));
	routers.push(...LinkedinStrategy.getRouter(configModule, options));
	routers.push(...FirebaseStrategy.getRouter(configModule, options));
	routers.push(...Auth0Strategy.getRouter(configModule, options));
	routers.push(...AzureStrategy.getRouter(configModule, options));
	routers.push(...SteamStrategy.getRouter(configModule, options));

	return routers;
}

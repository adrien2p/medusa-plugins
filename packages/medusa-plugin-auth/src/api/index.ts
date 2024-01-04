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

import { AuthOptions, AuthOptionsWrapper, handleOption } from '../types';

export default async function (rootDirectory, pluginOptions: AuthOptions | AuthOptions[]): Promise<Router[]> {
	const configModule = loadConfig(rootDirectory);
	return loadRouters(configModule, pluginOptions);
}

async function loadRouters(
	configModule: ConfigModule,
	options: AuthOptionsWrapper | AuthOptionsWrapper[]
): Promise<Router[]> {
	const routers: Router[] = [];

	const options_ = Array.isArray(options) ? options : [options];
	for (const opt of options_) {
		const option = await handleOption(opt, configModule);

		switch (option.type) {
			case 'azure_oidc':
				routers.push(...AzureStrategy.getRouter(configModule, option));
				break;
			case 'google':
				routers.push(...GoogleStrategy.getRouter(configModule, option));
				break;
			case 'facebook':
				routers.push(...FacebookStrategy.getRouter(configModule, option));
				break;
			case 'linkedin':
				routers.push(...LinkedinStrategy.getRouter(configModule, option));
				break;
			case 'firebase':
				routers.push(...FirebaseStrategy.getRouter(configModule, option));
				break;
			case 'auth0':
				routers.push(...Auth0Strategy.getRouter(configModule, option));
				break;
			case 'oauth2':
				routers.push(...OAuth2Strategy.getRouter(configModule, option));
				break;
		}
	}

	return routers;
}

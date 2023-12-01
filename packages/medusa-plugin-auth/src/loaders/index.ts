import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';

import { AuthOptionsWrapper, handleOption } from '../types';
import OAuth2Strategy from '../auth-strategies/oauth2';
import GoogleStrategy from '../auth-strategies/google';
import FacebookStrategy from '../auth-strategies/facebook';
import LinkedinStrategy from '../auth-strategies/linkedin';
import FireaseStrategy from '../auth-strategies/firebase';
import Auth0Strategy from '../auth-strategies/auth0';
import AzureStrategy from '../auth-strategies/azure-oidc';

export default async function authStrategiesLoader(
	container: MedusaContainer,
	authOptions: AuthOptionsWrapper | AuthOptionsWrapper[],
) {
	const configModule = container.resolve('configModule') as ConfigModule;
	if (Array.isArray(authOptions)) {
		for (const opt of authOptions) {
			await handleStrategyLoading(opt, configModule, container);
		}
	} else {
		await handleStrategyLoading(authOptions, configModule, container);
	}
}

async function handleStrategyLoading(opt: AuthOptionsWrapper, configModule: ConfigModule, container: MedusaContainer) {
	const option = await handleOption(opt, configModule, container);

	switch (option.type) {
		case 'azure_oidc':
			AzureStrategy.load(container, configModule, option);
			break;
		case 'google':
			GoogleStrategy.load(container, configModule, option);
			break;
		case 'facebook':
			FacebookStrategy.load(container, configModule, option);
			break;
		case 'linkedin':
			LinkedinStrategy.load(container, configModule, option);
			break;
		case 'firebase':
			FireaseStrategy.load(container, configModule, option);
			break;
		case 'auth0':
			Auth0Strategy.load(container, configModule, option);
			break;
		case 'oauth2':
			OAuth2Strategy.load(container, configModule, option);
			break;
	}
}

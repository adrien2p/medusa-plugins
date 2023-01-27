import { AuthOptions, StrategyExport } from '../../types';
import { Router } from 'express';
import { getFirebaseAdminAuthRouter, FirebaseAdminStrategy } from './admin';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { getFirebaseStoreAuthRouter, FirebaseStoreStrategy } from './store';
import { initializeApp } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

export * from './types';
export * from './admin';
export * from './store';

export default {
	load: (container: MedusaContainer, configModule: ConfigModule, options: AuthOptions): void => {
		// initialize firebase admin sdk
		if (options.firebase) {
			if (!options.firebase.credentialJsonPath) {
				throw new Error('Firebase authentication requires credentialJsonPath, but it has not been provided.');
			}

			try {
				const cred = credential.cert(options.firebase.credentialJsonPath);

				initializeApp({
					credential: cred,
				});
			} catch (error) {
				throw new Error(
					'Firebase authentication failed to initialize. Please check your credentialJsonPath and JSON file.'
				);
			}
		}

		if (options.firebase?.admin) {
			new FirebaseAdminStrategy(container, configModule, options.firebase);
		}

		if (options.firebase?.store) {
			new FirebaseStoreStrategy(container, configModule, options.firebase);
		}
	},
	getRouter: (configModule: ConfigModule, options: AuthOptions): Router[] => {
		const routers = [];

		if (options.firebase?.admin) {
			routers.push(getFirebaseAdminAuthRouter(options.firebase, configModule));
		}

		if (options.firebase?.store) {
			routers.push(getFirebaseStoreAuthRouter(options.firebase, configModule));
		}

		return routers;
	},
} as StrategyExport;

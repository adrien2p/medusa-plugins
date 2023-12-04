import { StrategyExport } from '../../types';
import { Router } from 'express';
import { getFirebaseAdminAuthRouter, getFirebaseAdminStrategy } from './admin';
import { getFirebaseStoreAuthRouter, getFirebaseStoreStrategy } from './store';
import { initializeApp } from 'firebase-admin/app';
import { credential } from 'firebase-admin';
import { FirebaseAuthOptions } from './types';

export * from './types';
export * from './admin';
export * from './store';

export default {
	load: (container, configModule, options): void => {
		const id = options.identifier ?? options.type;
		if (!options.credentialJsonPath) {
			throw new Error('Firebase authentication requires credentialJsonPath, but it has not been provided.');
		}

		try {
			const cred = credential.cert(options.credentialJsonPath);

			initializeApp({
				credential: cred,
			});
		} catch (error) {
			throw new Error(
				'Firebase authentication failed to initialize. Please check your credentialJsonPath and JSON file.'
			);
		}

		if (options.admin) {
			const Clazz = getFirebaseAdminStrategy(id);
			new Clazz(container, configModule, options, options.strict);
		}

		if (options.store) {
			const Clazz = getFirebaseStoreStrategy(id);
			new Clazz(container, configModule, options, options.strict);
		}
	},
	getRouter: (configModule, options): Router[] => {
		const id = options.identifier ?? options.type;
		const routers = [];

		if (options.admin) {
			routers.push(getFirebaseAdminAuthRouter(id, options, configModule));
		}

		if (options.store) {
			routers.push(getFirebaseStoreAuthRouter(id, options, configModule));
		}

		return routers;
	},
} as StrategyExport<FirebaseAuthOptions>;

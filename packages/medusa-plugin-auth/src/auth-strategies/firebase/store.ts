import { Router } from 'express';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Strategy as FirebaseStrategy, ExtractJwt } from 'passport-firebase-jwt';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateStoreCallback } from '../../core/validate-callback';
import { FIREBASE_STORE_STRATEGY_NAME, FirebaseAuthOptions, Profile } from './types';
import { firebaseAuthRoutesBuilder } from './utils';
import { auth } from 'firebase-admin';
import { AuthOptions } from '../../types';

export class FirebaseStoreStrategy extends PassportStrategy(FirebaseStrategy, FIREBASE_STORE_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: FirebaseAuthOptions,
		protected readonly strict?: AuthOptions['strict']
	) {
		super({
			jwtFromRequest: strategyOptions.store.jwtFromRequest ?? ExtractJwt.fromAuthHeaderAsBearerToken(),
		});
	}

	async validate(token: string): Promise<null | { id: string }> {
		const decodedToken = await auth().verifyIdToken(token);

		if (this.strategyOptions.store.verifyCallback) {
			return await this.strategyOptions.store.verifyCallback(this.container, decodedToken, this.strict);
		}

		const profile: Profile = { emails: [{ value: decodedToken.email }] };
		return await validateStoreCallback(profile, {
			container: this.container,
			strategyErrorIdentifier: 'firebase',
			strict: this.strict,
		});
	}
}

/**
 * Return the router that hold the firebase store authentication routes
 * @param firebase
 * @param configModule
 */
export function getFirebaseStoreAuthRouter(firebase: FirebaseAuthOptions, configModule: ConfigModule): Router {
	return firebaseAuthRoutesBuilder({
		domain: 'store',
		configModule,
		authPath: firebase.store.authPath ?? '/store/auth/firebase',
		strategyName: FIREBASE_STORE_STRATEGY_NAME,
	});
}

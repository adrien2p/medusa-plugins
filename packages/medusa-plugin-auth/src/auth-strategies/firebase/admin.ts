import { ExtractJwt, Strategy as FirebaseStrategy } from 'passport-firebase-jwt';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { FIREBASE_ADMIN_STRATEGY_NAME, FirebaseAuthOptions, Profile } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateAdminCallback } from '../../core/validate-callback';
import { firebaseAuthRoutesBuilder } from './utils';
import { auth } from 'firebase-admin';
import { AuthProvider, StrategyFactory } from '../../types';

export function getFirebaseAdminStrategy(id: string): StrategyFactory<FirebaseAuthOptions> {
	const strategyName = `${FIREBASE_ADMIN_STRATEGY_NAME}_${id}`;
	return class FirebaseAdminStrategy extends PassportStrategy(FirebaseStrategy, strategyName) {
		constructor(
			protected readonly container: MedusaContainer,
			protected readonly configModule: ConfigModule,
			protected readonly strategyOptions: FirebaseAuthOptions,
			protected readonly strict?: AuthProvider['strict']
		) {
			super({
				jwtFromRequest: strategyOptions.store.jwtFromRequest ?? ExtractJwt.fromAuthHeaderAsBearerToken(),
			});
		}

		async validate(token: string): Promise<null | { id: string }> {
			const decodedToken = await auth().verifyIdToken(token);

			if (this.strategyOptions.admin.verifyCallback) {
				return await this.strategyOptions.admin.verifyCallback(this.container, decodedToken, this.strict);
			}

			const profile: Profile = { emails: [{ value: decodedToken.email }] };
			return await validateAdminCallback(profile, {
				container: this.container,
				strategyErrorIdentifier: 'firebase',
				strict: this.strict,
				strategyName,
			});
		}
	};
}

/**
 * Return the router that hold the firebase admin authentication routes
 * @param id
 * @param firebase
 * @param configModule
 */
export function getFirebaseAdminAuthRouter(
	id: string,
	firebase: FirebaseAuthOptions,
	configModule: ConfigModule
): Router {
	const strategyName = `${FIREBASE_ADMIN_STRATEGY_NAME}_${id}`;
	return firebaseAuthRoutesBuilder({
		domain: 'admin',
		configModule,
		authPath: firebase.admin.authPath ?? '/admin/auth/firebase',
		strategyName,
		expiresIn: firebase.admin.expiresIn,
	});
}

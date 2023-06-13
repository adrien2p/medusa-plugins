import { ExtractJwt, Strategy as FirebaseStrategy } from 'passport-firebase-jwt';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { FIREBASE_ADMIN_STRATEGY_NAME, FirebaseAuthOptions, Profile } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateAdminCallback } from '../../core/validate-callback';
import { firebaseAuthRoutesBuilder } from './utils';
import { auth } from 'firebase-admin';

export class FirebaseAdminStrategy extends PassportStrategy(FirebaseStrategy, FIREBASE_ADMIN_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: FirebaseAuthOptions,
		protected readonly strictOptions?: { admin_strict?: boolean; strict?: boolean }
	) {
		super({
			jwtFromRequest: strategyOptions.store.jwtFromRequest ?? ExtractJwt.fromAuthHeaderAsBearerToken(),
		});
	}

	async validate(token: string): Promise<null | { id: string }> {
		const decodedToken = await auth().verifyIdToken(token);

		if (this.strategyOptions.admin.verifyCallback) {
			return await this.strategyOptions.admin.verifyCallback(this.container, decodedToken);
		}

		const profile: Profile = { emails: [{ value: decodedToken.email }] };
		return await validateAdminCallback(profile, {
			container: this.container,
			strategyErrorIdentifier: 'firebase',
			strict: this.strictOptions.admin_strict ?? this.strictOptions.strict,
		});
	}
}

/**
 * Return the router that hold the firebase admin authentication routes
 * @param firebase
 * @param configModule
 */
export function getFirebaseAdminAuthRouter(firebase: FirebaseAuthOptions, configModule: ConfigModule): Router {
	return firebaseAuthRoutesBuilder({
		domain: 'admin',
		configModule,
		authPath: firebase.admin.authPath ?? '/admin/auth/firebase',
		strategyName: FIREBASE_ADMIN_STRATEGY_NAME,
		expiresIn: firebase.admin.expiresIn,
	});
}

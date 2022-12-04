import passport from 'passport';
import { Router } from 'express';
import cors from 'cors';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { CustomerService } from '@medusajs/medusa';
import { MedusaError } from 'medusa-core-utils';
import { EntityManager } from 'typeorm';

import { CUSTOMER_METADATA_KEY, STORE_AUTH_TOKEN_COOKIE_NAME, TWENTY_FOUR_HOURS_IN_MS } from '../../types';
import { PassportStrategy } from '../../core/Strategy';
import { GOOGLE_STORE_STRATEGY_NAME, GoogleAuthOptions, Profile } from './types';
import { buildCallbackHandler } from '../../core/utils/build-callback-handler';

export class GoogleStoreStrategy extends PassportStrategy(GoogleStrategy, GOOGLE_STORE_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: GoogleAuthOptions
	) {
		super({
			clientID: strategyOptions.clientID,
			clientSecret: strategyOptions.clientSecret,
			callbackURL: strategyOptions.store.callbackUrl,
			passReqToCallback: true,
		});
	}

	async validate(
		req: Request,
		accessToken: string,
		refreshToken: string,
		profile: Profile
	): Promise<null | { id: string }> {
		if (this.strategyOptions.store.verifyCallback) {
			return await this.strategyOptions.store.verifyCallback(
				this.container,
				req,
				accessToken,
				refreshToken,
				profile
			);
		}
		return await this.defaultValidate(profile);
	}

	private async defaultValidate(profile: Profile): Promise<{ id: string } | never> {
		const manager: EntityManager = this.container.resolve('manager');
		const customerService: CustomerService = this.container.resolve('customerService');

		return await manager.transaction(async (transactionManager) => {
			const email = profile.emails?.[0]?.value;

			if (!email) {
				throw new MedusaError(
					MedusaError.Types.NOT_ALLOWED,
					`Your Google account does not contains any email and cannot be used`
				);
			}

			const customer = await customerService
				.withTransaction(transactionManager)
				.retrieveByEmail(email)
				.catch(() => void 0);

			if (customer) {
				if (!customer.metadata || !customer.metadata[CUSTOMER_METADATA_KEY]) {
					throw new MedusaError(
						MedusaError.Types.INVALID_DATA,
						`Customer with email ${email} already exists`
					);
				} else {
					return { id: customer.id };
				}
			}

			return await customerService
				.withTransaction(transactionManager)
				.create({
					email,
					metadata: {
						[CUSTOMER_METADATA_KEY]: true,
					},
					first_name: profile?.name.givenName ?? '',
					last_name: profile?.name.familyName ?? '',
				})
				.then((customer) => {
					return { id: customer.id };
				});
		});
	}
}

/**
 * Return the router that hold the google store authentication routes
 * @param google
 * @param configModule
 */
export function getGoogleStoreAuthRouter(google: GoogleAuthOptions, configModule: ConfigModule): Router {
	const router = Router();

	const storeCorsOptions = {
		origin: configModule.projectConfig.store_cors.split(','),
		credentials: true,
	};

	const authPath = google.store.authPath ?? '/store/auth/google';

	router.get(authPath, cors(storeCorsOptions));
	router.get(
		authPath,
		passport.authenticate(GOOGLE_STORE_STRATEGY_NAME, {
			scope: [
				'https://www.googleapis.com/auth/userinfo.email',
				'https://www.googleapis.com/auth/userinfo.profile',
			],
			session: false,
		})
	);

	const expiresIn = google.store.expiresIn ?? TWENTY_FOUR_HOURS_IN_MS;
	const callbackHandler = buildCallbackHandler(
		"store",
		STORE_AUTH_TOKEN_COOKIE_NAME,
		configModule.projectConfig.jwt_secret,
		expiresIn,
		google.store.successRedirect
	);
	const authPathCb = google.store.authCallbackPath ?? '/store/auth/google/cb';

	router.get(authPathCb, cors(storeCorsOptions));
	router.get(
		authPathCb,
		(req, res, next) => {
			if (req.user) {
				return callbackHandler(req, res);
			}

			next();
		},
		passport.authenticate(GOOGLE_STORE_STRATEGY_NAME, {
			failureRedirect: google.store.failureRedirect,
			session: false,
		}),
		callbackHandler
	);

	return router;
}

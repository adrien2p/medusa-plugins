import passport from 'passport';
import { Router } from 'express';
import cors from 'cors';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { CustomerService } from '@medusajs/medusa';
import { MedusaError } from 'medusa-core-utils';
import { EntityManager } from 'typeorm';

import { CUSTOMER_METADATA_KEY, STORE_AUTH_TOKEN_COOKIE_NAME, TWENTY_FOUR_HOURS_IN_MS } from '../../types';
import { FACEBOOK_STORE_STRATEGY_NAME, FacebookAuthOptions, Profile } from './types';
import { PassportStrategy } from '../../core/Strategy';
import { buildCallbackHandler } from '../../core/utils/build-callback-handler';

export class FacebookStoreStrategy extends PassportStrategy(FacebookStrategy, FACEBOOK_STORE_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: FacebookAuthOptions
	) {
		super({
			clientID: strategyOptions.clientID,
			clientSecret: strategyOptions.clientSecret,
			callbackURL: strategyOptions.store.callbackUrl,
			passReqToCallback: true,
			profileFields: ['id', 'displayName', 'email', 'gender', 'name'],
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
					`Your Facebook account does not contains any email and cannot be used`
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
 * Return the router that hold the facebook store authentication routes
 * @param facebook
 * @param configModule
 */
export function getFacebookStoreAuthRouter(facebook: FacebookAuthOptions, configModule: ConfigModule): Router {
	const router = Router();

	const storeCorsOptions = {
		origin: configModule.projectConfig.store_cors.split(','),
		credentials: true,
	};

	const authPath = facebook.store.authPath ?? '/store/auth/facebook';

	router.get(authPath, cors(storeCorsOptions));
	router.get(
		authPath,
		passport.authenticate(FACEBOOK_STORE_STRATEGY_NAME, {
			scope: ['email'],
			session: false,
		})
	);

	const expiresIn = facebook.store.expiresIn ?? TWENTY_FOUR_HOURS_IN_MS;
	const callbackHandler = buildCallbackHandler(
		"store",
		STORE_AUTH_TOKEN_COOKIE_NAME,
		configModule.projectConfig.jwt_secret,
		expiresIn,
		facebook.store.successRedirect
	);
	const authPathCb = facebook.store.authCallbackPath ?? '/store/auth/facebook/cb';

	router.get(authPathCb, cors(storeCorsOptions));
	router.get(
		authPathCb,
		(req, res, next) => {
			if (req.user) {
				return callbackHandler(req, res);
			}

			next();
		},
		passport.authenticate(FACEBOOK_STORE_STRATEGY_NAME, {
			failureRedirect: facebook.store.failureRedirect,
			session: false,
		}),
		callbackHandler
	);

	return router;
}

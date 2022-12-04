import passport from 'passport';
import { Router } from 'express';
import cors from 'cors';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Strategy as LinkedinStrategy } from 'passport-linkedin-oauth2';
import { CustomerService } from '@medusajs/medusa';
import { MedusaError } from 'medusa-core-utils';
import { EntityManager } from 'typeorm';

import { CUSTOMER_METADATA_KEY, STORE_AUTH_TOKEN_COOKIE_NAME, TWENTY_FOUR_HOURS_IN_MS } from '../../types';
import { PassportStrategy } from '../../core/Strategy';
import { LINKEDIN_STORE_STRATEGY_NAME, LinkedinAuthOptions, Profile } from './types';
import { buildCallbackHandler } from '../../core/utils/build-callback-handler';

export class LinkedinStoreStrategy extends PassportStrategy(LinkedinStrategy, LINKEDIN_STORE_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: LinkedinAuthOptions
	) {
		super({
			clientID: strategyOptions.clientID,
			clientSecret: strategyOptions.clientSecret,
			callbackURL: strategyOptions.store.callbackUrl,
			passReqToCallback: true,
			scope: ['r_emailaddress'],
			state: true,
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
					`Your Linkedin account does not contains any email and cannot be used`
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
 * Return the router that hold the linkedin store authentication routes
 * @param linkedin
 * @param configModule
 */
export function getLinkedinStoreAuthRouter(linkedin: LinkedinAuthOptions, configModule: ConfigModule): Router {
	const router = Router();

	const storeCorsOptions = {
		origin: configModule.projectConfig.store_cors.split(','),
		credentials: true,
	};

	const authPath = linkedin.store.authPath ?? '/store/auth/linkedin';

	router.get(authPath, cors(storeCorsOptions));
	router.get(
		authPath,
		passport.authenticate(LINKEDIN_STORE_STRATEGY_NAME, {
			scope: [
				'https://www.linkedinapis.com/auth/userinfo.email',
				'https://www.linkedinapis.com/auth/userinfo.profile',
			],
			session: false,
		})
	);

	const expiresIn = linkedin.store.expiresIn ?? TWENTY_FOUR_HOURS_IN_MS;
	const callbackHandler = buildCallbackHandler(
		"store",
		STORE_AUTH_TOKEN_COOKIE_NAME,
		configModule.projectConfig.jwt_secret,
		expiresIn,
		linkedin.store.successRedirect
	);
	const authPathCb = linkedin.store.authCallbackPath ?? '/store/auth/linkedin/cb';

	router.get(authPathCb, cors(storeCorsOptions));
	router.get(
		authPathCb,
		(req, res, next) => {
			if (req.user) {
				callbackHandler(req, res);
			}

			next();
		},
		passport.authenticate(LINKEDIN_STORE_STRATEGY_NAME, {
			failureRedirect: linkedin.store.failureRedirect,
			session: false,
		}),
		callbackHandler
	);

	return router;
}

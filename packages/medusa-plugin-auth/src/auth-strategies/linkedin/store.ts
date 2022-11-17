import passport from 'passport';
import { Router } from 'express';
import cors from 'cors';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import jwt from 'jsonwebtoken';
import { Strategy as LinkedinStrategy } from 'passport-linkedin-oauth2';
import { CustomerService } from '@medusajs/medusa';
import formatRegistrationName from '@medusajs/medusa/dist/utils/format-registration-name';
import { MedusaError } from 'medusa-core-utils';
import { EntityManager } from 'typeorm';

import { AUTH_TOKEN_COOKIE_NAME, CUSTOMER_METADATA_KEY, TWENTY_FOUR_HOURS_IN_MS } from '../../types';
import { getCookieOptions } from '../../utils/get-cookie-options';
import { LinkedinAuthOptions } from './index';

const LINKEDIN_STORE_STRATEGY_NAME = 'linkedin.store.medusa-auth-plugin';

/**
 * Load the linkedin strategy and attach the given verifyCallback or use the default implementation
 * @param container
 * @param configModule
 * @param linkedin
 */
export function loadLinkedinStoreStrategy(
	container: MedusaContainer,
	configModule: ConfigModule,
	linkedin: LinkedinAuthOptions
): void {
	const verifyCallbackFn: LinkedinAuthOptions['store']['verifyCallback'] =
		linkedin.store.verifyCallback ?? verifyStoreCallback;

	passport.use(
		LINKEDIN_STORE_STRATEGY_NAME,
		new LinkedinStrategy(
			{
				clientID: linkedin.clientID,
				clientSecret: linkedin.clientSecret,
				callbackURL: linkedin.store.callbackUrl,
				passReqToCallback: true,
				scope: ['r_emailaddress'],
				state: true,
			},
			async function (
				req: Request & { session: { jwt: string } },
				accessToken: string,
				refreshToken: string,
				profile: { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } },
				done: (err: null | unknown, data: null | { customer_id: string }) => void
			) {
				const done_ = (err: null | unknown, data: null | { id: string }) => {
					done(err, { customer_id: data?.id });
				};

				await verifyCallbackFn(container, req, accessToken, refreshToken, profile, done_);
			}
		)
	);
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

	router.get(linkedin.store.authPath, cors(storeCorsOptions));
	router.get(
		linkedin.store.authPath,
		passport.authenticate(LINKEDIN_STORE_STRATEGY_NAME, {
			scope: [
				'https://www.linkedinapis.com/auth/userinfo.email',
				'https://www.linkedinapis.com/auth/userinfo.profile',
			],
			session: false,
		})
	);

	router.get(linkedin.store.authCallbackPath, cors(storeCorsOptions));
	router.get(
		linkedin.store.authCallbackPath,
		passport.authenticate(LINKEDIN_STORE_STRATEGY_NAME, {
			failureRedirect: linkedin.store.failureRedirect,
			session: false,
		}),
		(req, res) => {
			const token = jwt.sign({ customer_id: req.user.customer_id }, configModule.projectConfig.jwt_secret, {
				expiresIn: linkedin.store.expiresIn ?? TWENTY_FOUR_HOURS_IN_MS,
			});
			res.cookie(AUTH_TOKEN_COOKIE_NAME, token, getCookieOptions()).redirect(linkedin.store.successRedirect);
		}
	);

	return router;
}

/**
 * Default callback to execute when the strategy is called.
 * @param container
 * @param req
 * @param accessToken
 * @param refreshToken
 * @param profile
 * @param done
 */
export async function verifyStoreCallback(
	container: MedusaContainer,
	req: Request,
	accessToken: string,
	refreshToken: string,
	profile: { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } },
	done: (err: null | unknown, data: null | { id: string }) => void
): Promise<void> {
	const manager: EntityManager = container.resolve('manager');
	const customerService: CustomerService = container.resolve(
		formatRegistrationName(`${process.cwd()}/services/customer.js`)
	);

	await manager.transaction(async (transactionManager) => {
		const email = profile.emails[0].value;

		const customer = await customerService
			.withTransaction(transactionManager)
			.retrieveByEmail(email)
			.catch(() => void 0);

		if (customer) {
			if (!customer.metadata || !customer.metadata[CUSTOMER_METADATA_KEY]) {
				const err = new MedusaError(
					MedusaError.Types.INVALID_DATA,
					`Customer with email ${email} already exists`
				);
				return done(err, null);
			} else {
				return done(null, { id: customer.id });
			}
		}

		await customerService
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
				return done(null, { id: customer.id });
			})
			.catch((err) => {
				return done(err, null);
			});
	});
}

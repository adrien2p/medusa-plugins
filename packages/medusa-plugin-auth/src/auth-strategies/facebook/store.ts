import passport from 'passport';
import { Router } from 'express';
import cors from 'cors';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import jwt from 'jsonwebtoken';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { CustomerService } from '@medusajs/medusa';
import formatRegistrationName from '@medusajs/medusa/dist/utils/format-registration-name';
import { MedusaError } from 'medusa-core-utils';
import { EntityManager } from 'typeorm';

import { AUTH_TOKEN_COOKIE_NAME, CUSTOMER_METADATA_KEY, TWENTY_FOUR_HOURS_IN_MS } from '../../types';
import { getCookieOptions } from '../../utils/get-cookie-options';
import { FacebookAuthOptions } from './types';

const FACEBOOK_STORE_STRATEGY_NAME = 'facebook.store.medusa-auth-plugin';

/**
 * Load the facebook strategy and attach the given verifyCallback or use the default implementation
 * @param container
 * @param configModule
 * @param facebook
 */
export function loadFacebookStoreStrategy(
	container: MedusaContainer,
	configModule: ConfigModule,
	facebook: FacebookAuthOptions
): void {
	const verifyCallbackFn: FacebookAuthOptions['store']['verifyCallback'] =
		facebook.store.verifyCallback ?? verifyStoreCallback;

	passport.use(
		FACEBOOK_STORE_STRATEGY_NAME,
		new FacebookStrategy(
			{
				clientID: facebook.clientID,
				clientSecret: facebook.clientSecret,
				callbackURL: facebook.store.callbackUrl,
				passReqToCallback: true,
			},
			async function (
				req: Request & { session: { jwt: string } },
				accessToken: string,
				refreshToken: string,
				profile: { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } },
				done: (err: null | unknown, data: null | { id: string }) => void
			) {
				const done_ = (err: null | unknown, data: null | { id: string }) => {
					done(err, data);
				};

				await verifyCallbackFn(container, req, accessToken, refreshToken, profile, done_);
			}
		)
	);
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

	router.get(facebook.store.authPath, cors(storeCorsOptions));
	router.get(
		facebook.store.authPath,
		passport.authenticate(FACEBOOK_STORE_STRATEGY_NAME, {
			scope: ['email'],
			session: false,
		})
	);

	router.get(facebook.store.authCallbackPath, cors(storeCorsOptions));
	router.get(
		facebook.store.authCallbackPath,
		passport.authenticate(FACEBOOK_STORE_STRATEGY_NAME, {
			failureRedirect: facebook.store.failureRedirect,
			session: false,
		}),
		(req, res) => {
			const token = jwt.sign({ userId: req.user.id }, configModule.projectConfig.jwt_secret, {
				expiresIn: facebook.store.expiresIn ?? TWENTY_FOUR_HOURS_IN_MS,
			});
			res.cookie(AUTH_TOKEN_COOKIE_NAME, token, getCookieOptions()).redirect(facebook.store.successRedirect);
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

import passport from 'passport';
import { Router } from 'express';
import cors from 'cors';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import jwt from 'jsonwebtoken';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { CustomerService } from '@medusajs/medusa';
import formatRegistrationName from '@medusajs/medusa/dist/utils/format-registration-name';
import { MedusaError } from 'medusa-core-utils';
import { EntityManager } from 'typeorm';

import { AUTH_TOKEN_COOKIE_NAME, CUSTOMER_METADATA_KEY, TWENTY_FOUR_HOURS_IN_MS } from '../../types';
import { getCookieOptions } from '../../utils/get-cookie-options';
import { GoogleAuthOptions } from './index';

const GOOGLE_STORE_STRATEGY_NAME = 'google.store.medusa-auth-plugin';

/**
 * Load the google strategy and attach the given verifyCallback or use the default implementation
 * @param container
 * @param configModule
 * @param google
 */
export function loadGoogleStoreStrategy(
	container: MedusaContainer,
	configModule: ConfigModule,
	google: GoogleAuthOptions
): void {
	const verifyCallbackFn: GoogleAuthOptions['store']['verifyCallback'] =
		google.store.verifyCallback ?? verifyStoreCallback;

	passport.use(
		GOOGLE_STORE_STRATEGY_NAME,
		new GoogleStrategy(
			{
				clientID: google.clientID,
				clientSecret: google.clientSecret,
				callbackURL: google.store.callbackUrl,
				passReqToCallback: true,
			},
			async function (
				req: Request & { session: { jwt: string } },
				accessToken: string,
				refreshToken: string,
				profile: { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } },
				done: (err: null | unknown, data: null | { customer_id: string }) => void
			) {
				const done_ = (err: null | unknown, data: null | { id: string }) => {
					done(err, { customer_id: data.id });
				};

				await verifyCallbackFn(container, req, accessToken, refreshToken, profile, done_);
			}
		)
	);
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

	router.get(google.store.authPath, cors(storeCorsOptions));
	router.get(
		google.store.authPath,
		passport.authenticate(GOOGLE_STORE_STRATEGY_NAME, {
			scope: [
				'https://www.googleapis.com/auth/userinfo.email',
				'https://www.googleapis.com/auth/userinfo.profile',
			],
			session: false,
		})
	);

	router.get(google.store.authCallbackPath, cors(storeCorsOptions));
	router.get(
		google.store.authCallbackPath,
		passport.authenticate(GOOGLE_STORE_STRATEGY_NAME, {
			failureRedirect: google.store.failureRedirect,
			session: false,
		}),
		(req, res) => {
			const token = jwt.sign({ userId: req.user.customer_id }, configModule.projectConfig.jwt_secret, {
				expiresIn: google.store.expiresIn ?? TWENTY_FOUR_HOURS_IN_MS,
			});
			res.cookie(AUTH_TOKEN_COOKIE_NAME, token, getCookieOptions()).redirect(google.store.successRedirect);
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

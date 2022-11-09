import passport from 'passport';
import { Router } from 'express';
import cors from 'cors';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import jwt from 'jsonwebtoken';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { CustomerService } from '@medusajs/medusa';
import formatRegistrationName from '@medusajs/medusa/dist/utils/format-registration-name';
import { MedusaError } from 'medusa-core-utils';
import { EntityManager } from 'typeorm';

import { AUTH_TOKEN_COOKIE_NAME, TWENTY_FOUR_HOURS_IN_MS, CUSTOMER_METADATA_KEY } from '../../types';
import { getCookieOptions } from '../../utils/get-cookie-options';
import { TwitterAuthOptions } from './index';

const TWITTER_STORE_STRATEGY_NAME = 'twitter.store.medusa-auth-plugin';

/**
 * Load the twitter strategy and attach the given verifyCallback or use the default implementation
 * @param container
 * @param configModule
 * @param twitter
 */
export function loadTwitterStoreStrategy(
	container: MedusaContainer,
	configModule: ConfigModule,
	twitter: TwitterAuthOptions
): void {
	const verifyCallbackFn: TwitterAuthOptions['store']['verifyCallback'] =
		twitter.admin.verifyCallback ?? verifyStoreCallback;

	passport.use(
		TWITTER_STORE_STRATEGY_NAME,
		new TwitterStrategy(
			{
				clientID: twitter.clientID,
				clientSecret: twitter.clientSecret,
				callbackURL: twitter.admin.callbackUrl,
				passReqToCallback: true,
				clientType: 'private',
				scope: ['tweet.read', 'offline.access'],
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
 * Return the router that hold the twitter store authentication routes
 * @param twitter
 * @param configModule
 */
export function getTwitterStoreAuthRouter(twitter: TwitterAuthOptions, configModule: ConfigModule): Router {
	const router = Router();

	const storeCorsOptions = {
		origin: configModule.projectConfig.store_cors.split(','),
		credentials: true,
	};

	router.get(twitter.store.authPath, cors(storeCorsOptions));
	router.get(
		twitter.store.authPath,
		passport.authenticate(TWITTER_STORE_STRATEGY_NAME, {
			scope: [
				'https://www.twitterapis.com/auth/userinfo.email',
				'https://www.twitterapis.com/auth/userinfo.profile',
			],
			session: false,
		})
	);

	router.get(twitter.store.authCallbackPath, cors(storeCorsOptions));
	router.get(
		twitter.store.authCallbackPath,
		passport.authenticate(TWITTER_STORE_STRATEGY_NAME, {
			failureRedirect: twitter.store.failureRedirect,
			session: false,
		}),
		(req, res) => {
			const token = jwt.sign({ userId: req.user.id }, configModule.projectConfig.jwt_secret, {
				expiresIn: twitter.store.expiresIn ?? TWENTY_FOUR_HOURS_IN_MS,
			});
			res.cookie(AUTH_TOKEN_COOKIE_NAME, token, getCookieOptions()).redirect(twitter.admin.successRedirect);
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

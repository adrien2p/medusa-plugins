import passport from 'passport'
import {Strategy as Auth0Strategy} from 'passport-auth0'
import jwt from 'jsonwebtoken'
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { CUSTOMER_METADATA_KEY, STORE_AUTH_TOKEN_COOKIE_NAME, TWENTY_FOUR_HOURS_IN_MS } from '../../types';
import { CustomerService } from '@medusajs/medusa';
import formatRegistrationName from '@medusajs/medusa/dist/utils/format-registration-name';
import { MedusaError } from 'medusa-core-utils';
import { Router } from 'express';
import cors from 'cors';
import { getCookieOptions } from '../../utils/get-cookie-options';
import { Auth0Options } from './types';
import { EntityManager } from 'typeorm';

const AUTH0_STORE_STRATEGY_NAME = 'auth0.store.medusa-auth-plugin';

/**
 * Load the auth0 strategy and attach the given verifyCallback or use the default implementation
 * @param container
 * @param configModule
 * @param auth0
 */
 export function loadAuth0StoreStrategy(
	container: MedusaContainer,
	configModule: ConfigModule,
	auth0: Auth0Options
): void {
	const verifyCallbackFn: Auth0Options['store']['verifyCallback'] =
		auth0.store.verifyCallback ?? verifyStoreCallback;

	passport.use(
		AUTH0_STORE_STRATEGY_NAME,
    new Auth0Strategy(
      {
        domain: auth0.auth0Domain,
        clientID: auth0.clientID,
        clientSecret: auth0.clientSecret,
        callbackURL: auth0.store.callbackUrl,
        passReqToCallback: true,
        state: true,
      },
      async (
				req: Request & { session: { jwt: string } },
				accessToken: string,
				refreshToken: string,
        extraParams: { audience?: string | undefined; connection?: string | undefined; prompt?: string | undefined;},
				profile: { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } },
				done: (err: null | unknown, data: null | { id: string }) => void
			) => {
				const done_ = (err: null | unknown, data: null | { id: string }) => {
					done(err, data);
				};

				await verifyCallbackFn(container, req, accessToken, refreshToken, extraParams, profile, done_);
			}
    )
	);
}

/**
 * Return the router that holds the auth0 store authentication routes
 * @param auth0
 * @param configModule
 */
 export function getAuth0StoreAuthRouter(auth0: Auth0Options, configModule: ConfigModule): Router {
	const router = Router();

	const storeCorsOptions = {
		origin: configModule.projectConfig.store_cors.split(','),
		credentials: true,
	};

	router.get(auth0.store.authPath, cors(storeCorsOptions));
	router.get(
		auth0.store.authPath,
		passport.authenticate(AUTH0_STORE_STRATEGY_NAME, {
      scope: 'openid email profile',
			session: false,
		})
	);

	router.get(auth0.store.authCallbackPath, cors(storeCorsOptions));
	router.get(
		auth0.store.authCallbackPath,
		passport.authenticate(AUTH0_STORE_STRATEGY_NAME, {
			failureRedirect: auth0.store.failureRedirect,
			session: false,
		}),
		(req, res) => {
			const token = jwt.sign({ customer_id: req.user.customer_id }, configModule.projectConfig.jwt_secret, {
				expiresIn: auth0.store.expiresIn ?? TWENTY_FOUR_HOURS_IN_MS,
			});
			res.cookie(STORE_AUTH_TOKEN_COOKIE_NAME, token, getCookieOptions()).redirect(auth0.store.successRedirect);
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
 * @param extraParams
 * @param profile
 * @param done
 */
 export async function verifyStoreCallback(
	container: MedusaContainer,
	req: Request,
	accessToken: string,
	refreshToken: string,
  extraParams: { audience?: string | undefined; connection?: string | undefined; prompt?: string | undefined;},
	profile: { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } },
	done: (err: null | unknown, data: null | { id: string }) => void
): Promise<void> {
	const manager: EntityManager = container.resolve('manager');
	const customerService: CustomerService = container.resolve(
		formatRegistrationName(`${process.cwd()}/services/customer.js`)
	);

	await manager.transaction(async (transactionManager) => {
		const email = profile.emails?.[0]?.value;

    if (!email) {
			const err = new MedusaError(
				MedusaError.Types.NOT_ALLOWED,
				`Your Auth0 account does not contains any email and cannot be used`
			);
			return done(err, null);
		}

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
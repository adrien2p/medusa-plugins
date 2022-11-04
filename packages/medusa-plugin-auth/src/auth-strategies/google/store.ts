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

import { AUTH_TOKEN_COOKIE_NAME, AuthOptions } from '../../types';
import { getCookieOptions } from '../../utils/get-cookie-options';
import { ENTITY_METADATA_KEY } from './index';

const GOOGLE_STORE_STRATEGY_NAME = 'google.store';

export function loadGoogleStoreStrategy(
	container: MedusaContainer,
	configModule: ConfigModule,
	google: AuthOptions['google']
): void {
	const manager: EntityManager = container.resolve('manager');
	const customerService: CustomerService = container.resolve(
		formatRegistrationName(`${process.cwd()}/services/customer.js`)
	);

	passport.serializeUser(function (user, done) {
		done(null, user);
	});
	passport.deserializeUser(function (user, done) {
		done(null, user);
	});

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
				done
			) {
				await manager.transaction(async (transactionManager) => {
					const email = profile.emails[0].value;

					const customer = await customerService
						.withTransaction(transactionManager)
						.retrieveByEmail(email)
						.catch(() => void 0);

					if (customer) {
						if (!customer.metadata[ENTITY_METADATA_KEY]) {
							const err = new MedusaError(
								MedusaError.Types.INVALID_DATA,
								`Customer with email ${email} already exists`
							);
							return done(err, null);
						} else {
							return done(null, { customer_id: customer.id });
						}
					}

					await customerService
						.withTransaction(transactionManager)
						.create({
							email,
							metadata: {
								[ENTITY_METADATA_KEY]: true,
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
		)
	);
}

export function getGoogleStoreAuthRouter(google: AuthOptions['google'], configModule: ConfigModule): Router {
	const router = Router();

	const adminCorsOptions = {
		origin: configModule.projectConfig.store_cors.split(','),
		credentials: true,
	};

	router.get(google.store.authPath, cors(adminCorsOptions));
	router.get(
		google.store.authPath,
		passport.authenticate(GOOGLE_STORE_STRATEGY_NAME, {
			scope: [
				'https://www.googleapis.com/auth/userinfo.email',
				'https://www.googleapis.com/auth/userinfo.profile',
			],
		})
	);

	router.get(google.store.authCallbackPath, cors(adminCorsOptions));
	router.get(
		google.store.authCallbackPath,
		passport.authenticate(GOOGLE_STORE_STRATEGY_NAME, {
			failureRedirect: google.store.failureRedirect,
		}),
		(req, res) => {
			const token = jwt.sign({ userId: req.user.id }, configModule.projectConfig.jwt_secret, {
				expiresIn: google.store.expiresIn ?? '30d',
			});
			res.cookie(AUTH_TOKEN_COOKIE_NAME, token, getCookieOptions()).redirect(google.admin.successRedirect);
		}
	);

	return router;
}

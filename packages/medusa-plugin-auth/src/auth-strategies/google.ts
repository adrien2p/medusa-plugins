import passport from 'passport';
import { Router } from 'express';
import cors from 'cors';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import jwt from 'jsonwebtoken';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { CustomerService, UserService } from '@medusajs/medusa';
import formatRegistrationName from '@medusajs/medusa/dist/utils/format-registration-name';
import { MedusaError } from 'medusa-core-utils';
import { generateEntityId } from '@medusajs/medusa/dist/utils';
import { EntityManager } from 'typeorm';

import { AUTH_TOKEN_COOKIE_NAME, AuthOptions } from '../types';

const GOOGLE_ADMIN_STRATEGY_NAME = 'google.admin';
const GOOGLE_STORE_STRATEGY_NAME = 'google.store';

export function loadGoogleAdminStrategy(
	container: MedusaContainer,
	configModule: ConfigModule,
	google: AuthOptions['google']
): void {
	const userService: UserService = container.resolve(formatRegistrationName(`${process.cwd()}/services/user.js`));

	const METADATA_KEY = 'useGoogleStrategy';

	passport.use(
		GOOGLE_ADMIN_STRATEGY_NAME,
		new GoogleStrategy(
			{
				clientID: google.clientID,
				clientSecret: google.clientSecret,
				callbackURL: google.admin.callbackUrl,
				passReqToCallback: true,
			},
			async function (
				req: Request & { session: { jwt: string } },
				accessToken: string,
				refreshToken: string,
				profile: { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } },
				done
			) {
				const email = profile.emails[0].value;

				const user = await userService.retrieveByEmail(email).catch(() => void 0);
				if (user) {
					if (!user.metadata[METADATA_KEY]) {
						const err = new MedusaError(
							MedusaError.Types.INVALID_DATA,
							`User with email ${email} already exists`
						);
						return done(err, null);
					} else {
						return done(null, { id: user.id });
					}
				}

				await userService
					.create(
						{
							email,
							metadata: {
								[METADATA_KEY]: true,
							},
							first_name: profile?.name.givenName ?? '',
							last_name: profile?.name.familyName ?? '',
						},
						generateEntityId('temp_pass_')
					)
					.then((user) => {
						return done(null, { id: user.id });
					})
					.catch((err) => {
						return done(err, null);
					});
			}
		)
	);
}

export function getGoogleAdminAuthRouter(google: AuthOptions['google'], configModule: ConfigModule): Router {
	const router = Router();

	const adminCorsOptions = {
		origin: configModule.projectConfig.admin_cors.split(','),
		credentials: true,
	};

	router.get(google.admin.authPath, cors(adminCorsOptions));
	router.get(
		google.admin.authPath,
		passport.authenticate(GOOGLE_ADMIN_STRATEGY_NAME, {
			scope: [
				'https://www.googleapis.com/auth/userinfo.email',
				'https://www.googleapis.com/auth/userinfo.profile',
			],
			session: false,
		})
	);

	router.get(google.admin.authCallbackPath, cors(adminCorsOptions));
	router.get(
		google.admin.authCallbackPath,
		passport.authenticate(GOOGLE_ADMIN_STRATEGY_NAME, {
			failureRedirect: google.admin.failureRedirect,
			session: false,
		}),
		(req, res) => {
			const token = jwt.sign({ userId: req.user.id }, configModule.projectConfig.jwt_secret, {
				expiresIn: google.admin.expiresIn ?? '24h',
			});
			res.cookie(AUTH_TOKEN_COOKIE_NAME, token).redirect(google.admin.successRedirect);
		}
	);

	return router;
}

export function loadGoogleStoreStrategy(
	container: MedusaContainer,
	configModule: ConfigModule,
	google: AuthOptions['google']
): void {
	const manager: EntityManager = container.resolve('manager');
	const customerService: CustomerService = container.resolve(
		formatRegistrationName(`${process.cwd()}/services/customer.js`)
	);

	const METADATA_KEY = 'useGoogleStrategy';

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
						if (!customer.metadata[METADATA_KEY]) {
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
								[METADATA_KEY]: true,
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
		passport.authenticate(GOOGLE_ADMIN_STRATEGY_NAME, {
			scope: [
				'https://www.googleapis.com/auth/userinfo.email',
				'https://www.googleapis.com/auth/userinfo.profile',
			],
		})
	);

	router.get(google.store.authCallbackPath, cors(adminCorsOptions));
	router.get(
		google.store.authCallbackPath,
		passport.authenticate(GOOGLE_ADMIN_STRATEGY_NAME, {
			failureRedirect: google.store.failureRedirect,
		}),
		(req, res) => {
			const token = jwt.sign({ userId: req.user.id }, configModule.projectConfig.jwt_secret, {
				expiresIn: google.store.expiresIn ?? '30d',
			});
			res.cookie(AUTH_TOKEN_COOKIE_NAME, token).redirect(google.admin.successRedirect);
		}
	);

	return router;
}

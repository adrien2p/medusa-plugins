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

import { AuthOptions } from '../types';

const GOOGLE_ADMIN_STRATEGY = 'google.admin';
const GOOGLE_STORE_STRATEGY = 'google.store';

export function loadGoogleAdminStrategy(
	container: MedusaContainer,
	configModule: ConfigModule,
	google: AuthOptions['google']
): void {
	const userService: UserService = container.resolve(formatRegistrationName(`${process.cwd()}/services/user.js`));

	const METADATA_KEY = 'useGoogleStrategy';

	passport.serializeUser(function (user, done) {
		done(null, user);
	});
	passport.deserializeUser(function (user, done) {
		done(null, user);
	});

	passport.use(
		GOOGLE_ADMIN_STRATEGY,
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
						req.session.jwt = jwt.sign({ userId: user.id }, configModule.projectConfig.jwt_secret, {
							expiresIn: google.admin.expiresIn ?? "24h",
						});
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
						req.session.jwt = jwt.sign({ userId: user.id }, configModule.projectConfig.jwt_secret, {
							expiresIn: '24h',
						});
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
		passport.authenticate(GOOGLE_ADMIN_STRATEGY, {
			scope: ['email', 'profile'],
		})
	);

	router.get(google.admin.authCallbackPath, cors(adminCorsOptions));
	router.get(
		google.admin.authCallbackPath,
		passport.authenticate(GOOGLE_ADMIN_STRATEGY, {
			failureRedirect: google.admin.failureRedirect,
			successRedirect: google.admin.successRedirect,
		})
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
		GOOGLE_STORE_STRATEGY,
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
							req.session.jwt = jwt.sign(
								{ customer_id: customer.id },
								configModule.projectConfig.jwt_secret,
								{
									expiresIn: '24h',
								}
							);
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
						.then((user) => {
							req.session.jwt = jwt.sign({ userId: user.id }, configModule.projectConfig.jwt_secret, {
								expiresIn: google.admin.expiresIn ?? "30d",
							});
							return done(null, { id: user.id });
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
		passport.authenticate(GOOGLE_ADMIN_STRATEGY, {
			scope: ['email', 'profile'],
		})
	);

	router.get(google.store.authCallbackPath, cors(adminCorsOptions));
	router.get(
		google.store.authCallbackPath,
		passport.authenticate(GOOGLE_ADMIN_STRATEGY, {
			failureRedirect: google.store.failureRedirect,
			successRedirect: google.store.successRedirect,
		})
	);

	return router;
}

import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import jwt from 'jsonwebtoken';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { ADMIN_AUTH_TOKEN_COOKIE_NAME, TWENTY_FOUR_HOURS_IN_MS } from '../../types';
import { UserService } from '@medusajs/medusa';
import formatRegistrationName from '@medusajs/medusa/dist/utils/format-registration-name';
import { MedusaError } from 'medusa-core-utils';
import { Router } from 'express';
import cors from 'cors';
import { getCookieOptions } from '../../utils/get-cookie-options';
import { FacebookAuthOptions } from './types';

const FACEBOOK_ADMIN_STRATEGY_NAME = 'facebook.admin.medusa-auth-plugin';

/**
 * Load the facebook strategy and attach the given verifyCallback or use the default implementation
 * @param container
 * @param configModule
 * @param facebook
 */
export function loadFacebookAdminStrategy(
	container: MedusaContainer,
	configModule: ConfigModule,
	facebook: FacebookAuthOptions
): void {
	const verifyCallbackFn: FacebookAuthOptions['admin']['verifyCallback'] =
		facebook.admin.verifyCallback ?? verifyAdminCallback;

	passport.use(
		FACEBOOK_ADMIN_STRATEGY_NAME,
		new FacebookStrategy(
			{
				clientID: facebook.clientID,
				clientSecret: facebook.clientSecret,
				callbackURL: facebook.admin.callbackUrl,
				passReqToCallback: true,
				profileFields: ['id', 'displayName', 'email', 'gender', 'name'],
			},
			async (
				req: Request & { session: { jwt: string } },
				accessToken: string,
				refreshToken: string,
				profile: { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } },
				done: (err: null | unknown, data: null | { id: string }) => void
			) => {
				const done_ = (err: null | unknown, data: null | { id: string }) => {
					if (err) {
						return done(err, null);
					}
					done(null, data);
				};

				await verifyCallbackFn(container, req, accessToken, refreshToken, profile, done_);
			}
		)
	);
}

/**
 * Return the router that hold the facebook admin authentication routes
 * @param facebook
 * @param configModule
 */
export function getFacebookAdminAuthRouter(facebook: FacebookAuthOptions, configModule: ConfigModule): Router {
	const router = Router();

	const adminCorsOptions = {
		origin: configModule.projectConfig.admin_cors.split(','),
		credentials: true,
	};

	router.get(facebook.admin.authPath, cors(adminCorsOptions));
	router.get(
		facebook.admin.authPath,
		passport.authenticate(FACEBOOK_ADMIN_STRATEGY_NAME, {
			scope: ['email'],
			session: false,
		})
	);

	const callbackHandler = (req, res) => {
		const token = jwt.sign({ userId: req.user.id }, configModule.projectConfig.jwt_secret, {
			expiresIn: facebook.admin.expiresIn ?? TWENTY_FOUR_HOURS_IN_MS,
		});
		res.cookie(ADMIN_AUTH_TOKEN_COOKIE_NAME, token, getCookieOptions()).redirect(facebook.admin.successRedirect);
	};

	router.get(facebook.admin.authCallbackPath, cors(adminCorsOptions));
	router.get(
		facebook.admin.authCallbackPath,
		(req, res, next) => {
			if (req.user) {
				callbackHandler(req, res);
			}

			next();
		},
		passport.authenticate(FACEBOOK_ADMIN_STRATEGY_NAME, {
			failureRedirect: facebook.admin.failureRedirect,
			session: false,
		}),
		callbackHandler
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
export async function verifyAdminCallback(
	container: MedusaContainer,
	req: Request,
	accessToken: string,
	refreshToken: string,
	profile: { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } },
	done: (err: null | unknown, data: null | { id: string }) => void
): Promise<void> {
	const userService: UserService = container.resolve(formatRegistrationName(`${process.cwd()}/services/user.js`));
	const email = profile.emails?.[0]?.value;

	if (!email) {
		const err = new MedusaError(
			MedusaError.Types.NOT_ALLOWED,
			`Your facebook account does not contains any email and cannot be used`
		);
		return done(err, null);
	}

	const user = await userService.retrieveByEmail(email).catch(() => void 0);
	if (!user) {
		const err = new MedusaError(
			MedusaError.Types.NOT_ALLOWED,
			`Unable to authenticate the user with the email ${email}`
		);
		return done(err, null);
	}

	return done(null, { id: user.id });
}

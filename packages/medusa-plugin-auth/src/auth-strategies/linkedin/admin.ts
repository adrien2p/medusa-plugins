import passport from 'passport';
import { Strategy as LinkedinStrategy } from 'passport-linkedin-oauth2';
import jwt from 'jsonwebtoken';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AUTH_TOKEN_COOKIE_NAME, TWENTY_FOUR_HOURS_IN_MS } from '../../types';
import { UserService } from '@medusajs/medusa';
import formatRegistrationName from '@medusajs/medusa/dist/utils/format-registration-name';
import { MedusaError } from 'medusa-core-utils';
import { Router } from 'express';
import cors from 'cors';
import { getCookieOptions } from '../../utils/get-cookie-options';
import { LinkedinAuthOptions } from './types';

const LINKEDIN_ADMIN_STRATEGY_NAME = 'linkedin.admin.medusa-auth-plugin';

/**
 * Load the linkedin strategy and attach the given verifyCallback or use the default implementation
 * @param container
 * @param configModule
 * @param linkedin
 */
export function loadLinkedinAdminStrategy(
	container: MedusaContainer,
	configModule: ConfigModule,
	linkedin: LinkedinAuthOptions
): void {
	const verifyCallbackFn: LinkedinAuthOptions['admin']['verifyCallback'] =
		linkedin.admin.verifyCallback ?? verifyAdminCallback;

	passport.use(
		LINKEDIN_ADMIN_STRATEGY_NAME,
		new LinkedinStrategy(
			{
				clientID: linkedin.clientID,
				clientSecret: linkedin.clientSecret,
				callbackURL: linkedin.admin.callbackUrl,
				passReqToCallback: true,
				scope: ['r_emailaddress'],
				state: true,
			},
			async (
				req: Request & { session: { jwt: string } },
				accessToken: string,
				refreshToken: string,
				profile: { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } },
				done: (err: null | unknown, data: null | { id: string }) => void
			) => {
				const done_ = (err: null | unknown, data: null | { id: string }) => {
					done(err, data);
				};

				await verifyCallbackFn(container, req, accessToken, refreshToken, profile, done_);
			}
		)
	);
}

/**
 * Return the router that hold the linkedin admin authentication routes
 * @param linkedin
 * @param configModule
 */
export function getLinkedinAdminAuthRouter(linkedin: LinkedinAuthOptions, configModule: ConfigModule): Router {
	const router = Router();

	const adminCorsOptions = {
		origin: configModule.projectConfig.admin_cors.split(','),
		credentials: true,
	};

	router.get(linkedin.admin.authPath, cors(adminCorsOptions));
	router.get(
		linkedin.admin.authPath,
		passport.authenticate(LINKEDIN_ADMIN_STRATEGY_NAME, {
			scope: [
				'https://www.linkedinapis.com/auth/userinfo.email',
				'https://www.linkedinapis.com/auth/userinfo.profile',
			],
			session: false,
		})
	);

	const callbackHandler = (req, res) => {
		const token = jwt.sign({ userId: req.user.id }, configModule.projectConfig.jwt_secret, {
			expiresIn: linkedin.admin.expiresIn ?? TWENTY_FOUR_HOURS_IN_MS,
		});
		res.cookie(AUTH_TOKEN_COOKIE_NAME, token, getCookieOptions()).redirect(linkedin.admin.successRedirect);
	};

	router.get(linkedin.admin.authCallbackPath, cors(adminCorsOptions));
	router.get(
		linkedin.admin.authCallbackPath,
		(req, res, next) => {
			if (req.user) {
				callbackHandler(req, res);
			}

			next();
		},
		passport.authenticate(LINKEDIN_ADMIN_STRATEGY_NAME, {
			failureRedirect: linkedin.admin.failureRedirect,
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
	const email = profile.emails[0].value;

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

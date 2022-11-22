import passport from 'passport';
import { Strategy as TwitterStrategy } from '@superfaceai/passport-twitter-oauth2';
import jwt from 'jsonwebtoken';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { ADMIN_AUTH_TOKEN_COOKIE_NAME, TWENTY_FOUR_HOURS_IN_MS } from '../../types';
import { UserService } from '@medusajs/medusa';
import formatRegistrationName from '@medusajs/medusa/dist/utils/format-registration-name';
import { MedusaError } from 'medusa-core-utils';
import { Router } from 'express';
import cors from 'cors';
import { getCookieOptions } from '../../utils/get-cookie-options';
import { TwitterAuthOptions } from './types';

const TWITTER_ADMIN_STRATEGY_NAME = 'twitter.admin.medusa-auth-plugin';

/**
 * Load the twitter strategy and attach the given verifyCallback or use the default implementation
 * @param container
 * @param configModule
 * @param twitter
 */
export function loadTwitterAdminStrategy(
	container: MedusaContainer,
	configModule: ConfigModule,
	twitter: TwitterAuthOptions
): void {
	const verifyCallbackFn: TwitterAuthOptions['admin']['verifyCallback'] =
		twitter.admin.verifyCallback ?? verifyAdminCallback;

	passport.use(
		TWITTER_ADMIN_STRATEGY_NAME,
		new TwitterStrategy(
			{
				clientID: twitter.clientID,
				clientSecret: twitter.clientSecret,
				callbackURL: twitter.admin.callbackUrl,
				passReqToCallback: true,
				clientType: 'private',
				scope: ['tweet.read', 'offline.access'],
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
 * Return the router that hold the twitter admin authentication routes
 * @param twitter
 * @param configModule
 */
export function getTwitterAdminAuthRouter(twitter: TwitterAuthOptions, configModule: ConfigModule): Router {
	const router = Router();

	const adminCorsOptions = {
		origin: configModule.projectConfig.admin_cors.split(','),
		credentials: true,
	};

	router.get(twitter.admin.authPath, cors(adminCorsOptions));
	router.get(
		twitter.admin.authPath,
		passport.authenticate(TWITTER_ADMIN_STRATEGY_NAME, {
			session: false,
		})
	);

	const callbackHandler = (req, res) => {
		const token = jwt.sign({ userId: req.user.id }, configModule.projectConfig.jwt_secret, {
			expiresIn: twitter.admin.expiresIn ?? TWENTY_FOUR_HOURS_IN_MS,
		});
		res.cookie(ADMIN_AUTH_TOKEN_COOKIE_NAME, token, getCookieOptions()).redirect(twitter.admin.successRedirect);
	};

	router.get(twitter.admin.authCallbackPath, cors(adminCorsOptions));
	router.get(
		twitter.admin.authCallbackPath,
		(req, res, next) => {
			if (req.user) {
				callbackHandler(req, res);
			}

			next();
		},
		passport.authenticate(TWITTER_ADMIN_STRATEGY_NAME, {
			failureRedirect: twitter.admin.failureRedirect,
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

import passport from 'passport'
import {Strategy as Auth0Strategy} from 'passport-auth0'
import jwt from 'jsonwebtoken'
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { ADMIN_AUTH_TOKEN_COOKIE_NAME, TWENTY_FOUR_HOURS_IN_MS } from '../../types';
import { UserService } from '@medusajs/medusa';
import formatRegistrationName from '@medusajs/medusa/dist/utils/format-registration-name';
import { MedusaError } from 'medusa-core-utils';
import { Router } from 'express';
import cors from 'cors';
import { getCookieOptions } from '../../utils/get-cookie-options';
import { Auth0Options } from './types';

const AUTH0_ADMIN_STRATEGY_NAME = 'auth0.admin.medusa-auth-plugin'

/**
 * Load the auth0 strategy and attach the given verifyCallback or use the default implementation
 * @param container
 * @param configModule
 * @param auth0
 */
 export function loadAuth0AdminStrategy(
	container: MedusaContainer,
	configModule: ConfigModule,
	auth0: Auth0Options
): void {
	const verifyCallbackFn: Auth0Options['admin']['verifyCallback'] =
		auth0.admin.verifyCallback ?? verifyAdminCallback;

	passport.use(
		AUTH0_ADMIN_STRATEGY_NAME,
    new Auth0Strategy(
      {
        domain: auth0.auth0Domain,
        clientID: auth0.clientID,
        clientSecret: auth0.clientSecret,
        callbackURL: auth0.admin.callbackUrl,
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
 * Return the router that holds the auth0 admin authentication routes
 * @param auth0
 * @param configModule
 */
 export function getAuth0AdminAuthRouter(auth0: Auth0Options, configModule: ConfigModule): Router {
	const router = Router();

	const adminCorsOptions = {
		origin: configModule.projectConfig.admin_cors.split(','),
		credentials: true,
	};

	router.get(auth0.admin.authPath, cors(adminCorsOptions));
	router.get(
		auth0.admin.authPath,
		passport.authenticate(AUTH0_ADMIN_STRATEGY_NAME, {
      scope: 'openid email profile',
			session: false,
		})
	);

	const callbackHandler = (req, res) => {
		const token = jwt.sign({ userId: req.user.id }, configModule.projectConfig.jwt_secret, {
			expiresIn: auth0.admin.expiresIn ?? TWENTY_FOUR_HOURS_IN_MS,
		});
		res.cookie(ADMIN_AUTH_TOKEN_COOKIE_NAME, token, getCookieOptions()).redirect(auth0.admin.successRedirect);
	};

	router.get(auth0.admin.authCallbackPath, cors(adminCorsOptions));
	router.get(
		auth0.admin.authCallbackPath,
		(req, res, next) => {
			if (req.user) {
				callbackHandler(req, res);
			}

			next();
		},
		passport.authenticate(AUTH0_ADMIN_STRATEGY_NAME, {
			failureRedirect: auth0.admin.failureRedirect,
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
 * @param extraParams
 * @param profile
 * @param done
 */
 export async function verifyAdminCallback(
	container: MedusaContainer,
	req: Request,
	accessToken: string,
	refreshToken: string,
  extraParams: { audience?: string | undefined; connection?: string | undefined; prompt?: string | undefined;},
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

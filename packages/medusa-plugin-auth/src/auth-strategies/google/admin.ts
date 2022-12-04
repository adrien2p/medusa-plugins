import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { ADMIN_AUTH_TOKEN_COOKIE_NAME, TWENTY_FOUR_HOURS_IN_MS } from '../../types';
import { UserService } from '@medusajs/medusa';
import { MedusaError } from 'medusa-core-utils';
import { Router } from 'express';
import cors from 'cors';
import { GOOGLE_ADMIN_STRATEGY_NAME, GoogleAuthOptions, Profile } from './types';
import { PassportStrategy } from '../../core/Strategy';
import { buildCallbackHandler } from '../../core/utils/build-callback-handler';

export class GoogleAdminStrategy extends PassportStrategy(GoogleStrategy, GOOGLE_ADMIN_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: GoogleAuthOptions
	) {
		super({
			clientID: strategyOptions.clientID,
			clientSecret: strategyOptions.clientSecret,
			callbackURL: strategyOptions.admin.callbackUrl,
			passReqToCallback: true,
		});
	}

	async validate(
		req: Request,
		accessToken: string,
		refreshToken: string,
		profile: Profile
	): Promise<null | { id: string }> {
		if (this.strategyOptions.admin.verifyCallback) {
			return await this.strategyOptions.admin.verifyCallback(
				this.container,
				req,
				accessToken,
				refreshToken,
				profile
			);
		}
		return await this.defaultValidate(profile);
	}

	private async defaultValidate(profile: Profile): Promise<{ id: string } | never> {
		const userService: UserService = this.container.resolve('userService');
		const email = profile.emails?.[0]?.value;

		if (!email) {
			throw new MedusaError(
				MedusaError.Types.NOT_ALLOWED,
				`Your Google account does not contains any email and cannot be used`
			);
		}

		const user = await userService.retrieveByEmail(email).catch(() => void 0);
		if (!user) {
			throw new MedusaError(
				MedusaError.Types.NOT_ALLOWED,
				`Unable to authenticate the user with the email ${email}`
			);
		}

		return { id: user.id };
	}
}

/**
 * Return the router that hold the google admin authentication routes
 * @param google
 * @param configModule
 */
export function getGoogleAdminAuthRouter(google: GoogleAuthOptions, configModule: ConfigModule): Router {
	const router = Router();

	const adminCorsOptions = {
		origin: configModule.projectConfig.admin_cors.split(','),
		credentials: true,
	};

	const authPath = google.admin.authPath ?? '/admin/auth/google';

	router.get(authPath, cors(adminCorsOptions));
	router.get(
		authPath,
		passport.authenticate(GOOGLE_ADMIN_STRATEGY_NAME, {
			scope: [
				'https://www.googleapis.com/auth/userinfo.email',
				'https://www.googleapis.com/auth/userinfo.profile',
			],
			session: false,
		})
	);

	const expiresIn = google.admin.expiresIn ?? TWENTY_FOUR_HOURS_IN_MS;
	const callbackHandler = buildCallbackHandler(
		"admin",
		ADMIN_AUTH_TOKEN_COOKIE_NAME,
		configModule.projectConfig.jwt_secret,
		expiresIn,
		google.admin.successRedirect
	);
	const authPathCb = google.admin.authCallbackPath ?? '/admin/auth/google/cb';

	router.get(authPathCb, cors(adminCorsOptions));
	router.get(
		authPathCb,
		(req, res, next) => {
			if (req.user) {
				return callbackHandler(req, res);
			}

			next();
		},
		passport.authenticate(GOOGLE_ADMIN_STRATEGY_NAME, {
			failureRedirect: google.admin.failureRedirect,
			session: false,
		}),
		callbackHandler
	);

	return router;
}

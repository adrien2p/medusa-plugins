import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { ADMIN_AUTH_TOKEN_COOKIE_NAME, TWENTY_FOUR_HOURS_IN_MS } from '../../types';
import { UserService } from '@medusajs/medusa';
import { MedusaError } from 'medusa-core-utils';
import { Router } from 'express';
import cors from 'cors';
import { FACEBOOK_ADMIN_STRATEGY_NAME, FacebookAuthOptions, Profile } from './types';
import { PassportStrategy } from '../../core/Strategy';
import { buildCallbackHandler } from '../../core/utils/build-callback-handler';

export class FacebookAdminStrategy extends PassportStrategy(FacebookStrategy, FACEBOOK_ADMIN_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: FacebookAuthOptions
	) {
		super({
			clientID: strategyOptions.clientID,
			clientSecret: strategyOptions.clientSecret,
			callbackURL: strategyOptions.admin.callbackUrl,
			passReqToCallback: true,
			profileFields: ['id', 'displayName', 'email', 'gender', 'name'],
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
				`Your facebook account does not contains any email and cannot be used`
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

	const authPath = facebook.admin.authPath ?? '/admin/auth/facebook';

	router.get(authPath, cors(adminCorsOptions));
	router.get(
		authPath,
		passport.authenticate(FACEBOOK_ADMIN_STRATEGY_NAME, {
			scope: ['email'],
			session: false,
		})
	);

	const expiresIn = facebook.admin.expiresIn ?? TWENTY_FOUR_HOURS_IN_MS;
	const callbackHandler = buildCallbackHandler(
		"admin",
		ADMIN_AUTH_TOKEN_COOKIE_NAME,
		configModule.projectConfig.jwt_secret,
		expiresIn,
		facebook.admin.successRedirect
	);
	const authPathCb = facebook.admin.authCallbackPath ?? '/admin/auth/facebook/cb';

	router.get(authPathCb, cors(adminCorsOptions));
	router.get(
		authPathCb,
		(req, res, next) => {
			if (req.user) {
				return callbackHandler(req, res);
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

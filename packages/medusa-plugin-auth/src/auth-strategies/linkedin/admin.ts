import passport from 'passport';
import { Strategy as LinkedinStrategy } from 'passport-linkedin-oauth2';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { ADMIN_AUTH_TOKEN_COOKIE_NAME, TWENTY_FOUR_HOURS_IN_MS } from '../../types';
import { UserService } from '@medusajs/medusa';
import { MedusaError } from 'medusa-core-utils';
import { Router } from 'express';
import cors from 'cors';
import { LINKEDIN_ADMIN_STRATEGY_NAME, LinkedinAuthOptions, Profile } from './types';
import { PassportStrategy } from '../../core/Strategy';
import { buildCallbackHandler } from '../../core/utils/build-callback-handler';

export class LinkedinAdminStrategy extends PassportStrategy(LinkedinStrategy, LINKEDIN_ADMIN_STRATEGY_NAME) {
	constructor(
		protected readonly container: MedusaContainer,
		protected readonly configModule: ConfigModule,
		protected readonly strategyOptions: LinkedinAuthOptions
	) {
		super({
			clientID: strategyOptions.clientID,
			clientSecret: strategyOptions.clientSecret,
			callbackURL: strategyOptions.admin.callbackUrl,
			passReqToCallback: true,
			scope: ['r_emailaddress'],
			state: true,
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
				`Your Linkedin account does not contains any email and cannot be used`
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

	const authPath = linkedin.admin.authPath ?? '/admin/auth/linkedin';

	router.get(authPath, cors(adminCorsOptions));
	router.get(
		authPath,
		passport.authenticate(LINKEDIN_ADMIN_STRATEGY_NAME, {
			scope: [
				'https://www.linkedinapis.com/auth/userinfo.email',
				'https://www.linkedinapis.com/auth/userinfo.profile',
			],
			session: false,
		})
	);

	const expiresIn = linkedin.admin.expiresIn ?? TWENTY_FOUR_HOURS_IN_MS;

	const callbackHandler = buildCallbackHandler(
		"admin",
		ADMIN_AUTH_TOKEN_COOKIE_NAME,
		configModule.projectConfig.jwt_secret,
		expiresIn,
		linkedin.admin.successRedirect
	);
	const authPathCb = linkedin.admin.authCallbackPath ?? '/admin/auth/linkedin/cb';

	router.get(authPathCb, cors(adminCorsOptions));
	router.get(
		authPathCb,
		(req, res, next) => {
			if (req.user) {
				return callbackHandler(req, res);
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

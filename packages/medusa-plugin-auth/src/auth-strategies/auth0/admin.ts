import passport from 'passport'
import {Strategy as Auth0Strategy} from 'passport-auth0'
import jwt from 'jsonwebtoken'
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { ADMIN_AUTH_TOKEN_COOKIE_NAME, TWENTY_FOUR_HOURS_IN_MS } from '../../types';
import { UserService } from '@medusajs/medusa';
import { MedusaError } from 'medusa-core-utils';
import { Router } from 'express';
import cors from 'cors';
import { getCookieOptions } from '../../utils/get-cookie-options';
import { AUTH0_ADMIN_STRATEGY_NAME, Auth0Options, Profile, ExtraParams } from './types';
import { PassportStrategy } from '../../core/Strategy';
export class Auth0AdminStrategy extends PassportStrategy(Auth0Strategy, AUTH0_ADMIN_STRATEGY_NAME) {
  constructor(
    protected readonly container: MedusaContainer,
    protected readonly configModule: ConfigModule,
    protected readonly strategyOptions: Auth0Options
  ) {
    super({
      domain: strategyOptions.auth0Domain,
      clientID: strategyOptions.clientID,
      clientSecret: strategyOptions.clientSecret,
      callbackURL: strategyOptions.admin.callbackUrl,
      passReqToCallback: true,
      state: true
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    extraParams: ExtraParams,
    profile: Profile
  ): Promise<null | { id: string }> {
    if (this.strategyOptions.admin.verifyCallback) {
      return await this.strategyOptions.admin.verifyCallback(
        this.container,
        req,
        accessToken,
        refreshToken,
        extraParams,
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

  const authPath = auth0.admin.authPath ?? '/admin/auth/auth0'

	router.get(authPath, cors(adminCorsOptions));
	router.get(
		authPath,
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

  const authPathCb = auth0.admin.authCallbackPath ?? '/admin/auth/auth0/cb'

	router.get(authPathCb, cors(adminCorsOptions));
	router.get(
		authPathCb,
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
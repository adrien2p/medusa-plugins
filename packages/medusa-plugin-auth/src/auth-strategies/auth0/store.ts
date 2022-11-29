
import passport from 'passport';
import { Router } from 'express';
import cors from 'cors';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import jwt from 'jsonwebtoken';
import {Strategy as Auth0Strategy} from 'passport-auth0'
import { CustomerService } from '@medusajs/medusa';
import { MedusaError } from 'medusa-core-utils';
import { EntityManager } from 'typeorm';

import { CUSTOMER_METADATA_KEY, STORE_AUTH_TOKEN_COOKIE_NAME, TWENTY_FOUR_HOURS_IN_MS } from '../../types';
import { getCookieOptions } from '../../utils/get-cookie-options';
import { PassportStrategy } from '../../core/Strategy';
import { Auth0Options, Profile, ExtraParams, AUTH0_STORE_STRATEGY_NAME } from './types';

export class Auth0StoreStrategy extends PassportStrategy(Auth0Strategy, AUTH0_STORE_STRATEGY_NAME) {
  constructor(
    protected readonly container: MedusaContainer,
    protected readonly configModule: ConfigModule,
    protected readonly strategyOptions: Auth0Options
  ) {
    super({
      domain: strategyOptions.auth0Domain,
      clientID: strategyOptions.clientID,
      clientSecret: strategyOptions.clientSecret,
      callbackURL: strategyOptions.store.callbackUrl,
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
    if (this.strategyOptions.store.verifyCallback) {
      return await this.strategyOptions.store.verifyCallback(
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
		const manager: EntityManager = this.container.resolve('manager');
		const customerService: CustomerService = this.container.resolve('customerService');

		return await manager.transaction(async (transactionManager) => {
			const email = profile.emails?.[0]?.value;

			if (!email) {
				throw new MedusaError(
					MedusaError.Types.NOT_ALLOWED,
					`Your Google account does not contains any email and cannot be used`
				);
			}

			const customer = await customerService
				.withTransaction(transactionManager)
				.retrieveByEmail(email)
				.catch(() => void 0);

			if (customer) {
				if (!customer.metadata || !customer.metadata[CUSTOMER_METADATA_KEY]) {
					throw new MedusaError(
						MedusaError.Types.INVALID_DATA,
						`Customer with email ${email} already exists`
					);
				} else {
					return { id: customer.id };
				}
			}

			return await customerService
				.withTransaction(transactionManager)
				.create({
					email,
					metadata: {
						[CUSTOMER_METADATA_KEY]: true,
					},
					first_name: profile?.name.givenName ?? '',
					last_name: profile?.name.familyName ?? '',
				})
				.then((customer) => {
					return { id: customer.id };
				});
		});
	}
}

/**
 * Return the router that holds the auth0 store authentication routes
 * @param auth0
 * @param configModule
 */
 export function getAuth0StoreAuthRouter(auth0: Auth0Options, configModule: ConfigModule): Router {
	const router = Router();

	const storeCorsOptions = {
		origin: configModule.projectConfig.store_cors.split(','),
		credentials: true,
	};

  const authPath = auth0.store.authPath ?? '/store/auth/auth0'

	router.get(authPath, cors(storeCorsOptions));
	router.get(
		authPath,
		passport.authenticate(AUTH0_STORE_STRATEGY_NAME, {
      scope: 'openid email profile',
			session: false,
		})
	);

  const authPathCb = auth0.store.authCallbackPath ?? "/store/auth/auth0/cb"

	router.get(authPathCb, cors(storeCorsOptions));
	router.get(
		authPathCb,
		passport.authenticate(AUTH0_STORE_STRATEGY_NAME, {
			failureRedirect: auth0.store.failureRedirect,
			session: false,
		}),
		(req, res) => {
			const token = jwt.sign({ customer_id: req.user.customer_id }, configModule.projectConfig.jwt_secret, {
				expiresIn: auth0.store.expiresIn ?? TWENTY_FOUR_HOURS_IN_MS,
			});
			res.cookie(STORE_AUTH_TOKEN_COOKIE_NAME, token, getCookieOptions()).redirect(auth0.store.successRedirect);
		}
	);

	return router;
}
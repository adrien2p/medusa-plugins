import { Router } from 'express';
import { ConfigModule } from '@medusajs/medusa/dist/types/global';
import wrapHandler from '@medusajs/medusa/dist/api/middlewares/await-middleware';
import loadConfig from '@medusajs/medusa/dist/loaders/config';
import cors from 'cors';

import { AUTH_TOKEN_COOKIE_NAME, AuthOptions } from '../types';
import { loadJwtOverrideStrategy } from '../auth-strategies/jwt-override';
import { getGoogleRoutes } from '../auth-strategies/google';
import { getFacebookRoutes } from '../auth-strategies/facebook';

export default function (rootDirectory, pluginOptions: AuthOptions): Router[] {
	const configModule = loadConfig(rootDirectory) as ConfigModule;

	loadJwtOverrideStrategy(configModule);

	return loadRouters(configModule, pluginOptions);
}

function loadRouters(configModule: ConfigModule, options: AuthOptions): Router[] {
	const routers: Router[] = [];

	routers.push(...getGoogleRoutes(configModule, options));
	routers.push(...getFacebookRoutes(configModule, options));

	return [...routers, getLogoutRouter(configModule)];
}

function getLogoutRouter(configModule: ConfigModule): Router {
	const router = Router();

	const logoutHandler = async (req, res) => {
		if (req.session) {
			req.session.jwt = {};
			req.session.destroy();
		}

		res.clearCookie(AUTH_TOKEN_COOKIE_NAME);

		res.status(200).json({});
	};

	const adminCorsOptions = {
		origin: configModule.projectConfig.admin_cors.split(','),
		credentials: true,
	};

	router.use('/admin/auth', cors(adminCorsOptions));
	router.delete('/admin/auth', wrapHandler(logoutHandler));

	const storeCorsOptions = {
		origin: configModule.projectConfig.store_cors.split(','),
		credentials: true,
	};

	router.use('/store/auth', cors(storeCorsOptions));
	router.delete('/store/auth', wrapHandler(logoutHandler));

	return router;
}

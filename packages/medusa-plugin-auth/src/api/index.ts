import { Router } from 'express';
import { ConfigModule } from '@medusajs/medusa/dist/types/global';
import wrapHandler from '@medusajs/medusa/dist/api/middlewares/await-middleware';
import loadConfig from '@medusajs/medusa/dist/loaders/config';
import cors from 'cors';

import { ADMIN_AUTH_TOKEN_COOKIE_NAME, AuthOptions, STORE_AUTH_TOKEN_COOKIE_NAME } from '../types';
import { loadJwtOverrideStrategy } from '../auth-strategies/jwt-override';
import { getGoogleRoutes } from '../auth-strategies/google';
import { getFacebookRoutes } from '../auth-strategies/facebook';
import { getTwitterRoutes } from '../auth-strategies/twitter';
import { getLinkedinRoutes } from "../auth-strategies/linkedin";

export default function (rootDirectory, pluginOptions: AuthOptions): Router[] {
	const configModule = loadConfig(rootDirectory) as ConfigModule;

	loadJwtOverrideStrategy(configModule);

	return loadRouters(configModule, pluginOptions);
}

function loadRouters(configModule: ConfigModule, options: AuthOptions): Router[] {
	const routers: Router[] = [];

	routers.push(...getGoogleRoutes(configModule, options));
	routers.push(...getFacebookRoutes(configModule, options));
	routers.push(...getTwitterRoutes(configModule, options));
	routers.push(...getLinkedinRoutes(configModule, options));
	routers.push(getLogoutRouter(configModule));

	return routers;
}

function getLogoutRouter(configModule: ConfigModule): Router {
	const router = Router();

	const adminCorsOptions = {
		origin: configModule.projectConfig.admin_cors.split(','),
		credentials: true,
	};

	router.use('/admin/auth', cors(adminCorsOptions));
	router.delete('/admin/auth', wrapHandler(async (req, res) => {
		if ((req as unknown as Request & { session: any }).session) {
			(req as unknown as Request & { session: any }).session.jwt = {};
			(req as unknown as Request & { session: any }).session.destroy();
		}

		res.clearCookie(ADMIN_AUTH_TOKEN_COOKIE_NAME);

		res.status(200).json({});
	}));

	const storeCorsOptions = {
		origin: configModule.projectConfig.store_cors.split(','),
		credentials: true,
	};

	router.use('/store/auth', cors(storeCorsOptions));
	router.delete('/store/auth', wrapHandler(async (req, res) => {
		if ((req as unknown as Request & { session: any }).session) {
			(req as unknown as Request & { session: any }).session.jwt = {};
			// The bellow line will be available in the next version of medusa core
			/*(req as unknown as Request & { session: any }).session.jwt_store = {};*/
			(req as unknown as Request & { session: any }).session.destroy();
		}

		res.clearCookie(STORE_AUTH_TOKEN_COOKIE_NAME);

		res.status(200).json({});
	}));

	return router;
}

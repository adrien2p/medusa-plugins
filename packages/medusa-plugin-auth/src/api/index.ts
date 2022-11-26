import { Router } from 'express';
import { ConfigModule } from '@medusajs/medusa/dist/types/global';
import wrapHandler from '@medusajs/medusa/dist/api/middlewares/await-middleware';
import loadConfig from '@medusajs/medusa/dist/loaders/config';
import cors from 'cors';
import GoogleStrategy from '../auth-strategies/google';
import FacebookStrategy from '../auth-strategies/facebook';
import LinkedinStrategy from '../auth-strategies/linkedin';

import { ADMIN_AUTH_TOKEN_COOKIE_NAME, AuthOptions, STORE_AUTH_TOKEN_COOKIE_NAME } from '../types';

export default function (rootDirectory, pluginOptions: AuthOptions): Router[] {
	const configModule = loadConfig(rootDirectory) as ConfigModule;
	return loadRouters(configModule, pluginOptions);
}

function loadRouters(configModule: ConfigModule, options: AuthOptions): Router[] {
	const routers: Router[] = [];

	routers.push(...GoogleStrategy.getRouter(configModule, options));
	routers.push(...FacebookStrategy.getRouter(configModule, options));
	routers.push(...LinkedinStrategy.getRouter(configModule, options));
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
	router.delete(
		'/admin/auth',
		wrapHandler(async (req, res) => {
			if ((req as unknown as Request & { session: unknown }).session) {
				(req as unknown as Request & { session: { jwt: string } }).session.jwt = null;
				(req as unknown as Request & { session: { destroy: () => void } }).session.destroy();
			}

			res.clearCookie(ADMIN_AUTH_TOKEN_COOKIE_NAME);

			res.status(200).json({});
		})
	);

	const storeCorsOptions = {
		origin: configModule.projectConfig.store_cors.split(','),
		credentials: true,
	};

	router.use('/store/auth', cors(storeCorsOptions));
	router.delete(
		'/store/auth',
		wrapHandler(async (req, res) => {
			if ((req as unknown as Request & { session: unknown }).session) {
				(req as unknown as Request & { session: { jwt_store: string } }).session.jwt_store = null;
				(req as unknown as Request & { session: { destroy: () => void } }).session.destroy();
			}

			res.clearCookie(STORE_AUTH_TOKEN_COOKIE_NAME);

			res.status(200).json({});
		})
	);

	return router;
}

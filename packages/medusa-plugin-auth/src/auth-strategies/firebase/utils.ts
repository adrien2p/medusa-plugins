import passport from 'passport';
import cors from 'cors';
import { ConfigModule } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { TWENTY_FOUR_HOURS_IN_MS } from '../../types';
import { sendTokenFactory } from '../../core/auth-callback-middleware';

function firebaseCallbackMiddleware(domain: 'admin' | 'store', secret: string, expiresIn: number) {
	return (req, res) => {
		const sendToken = sendTokenFactory(domain, secret, expiresIn);
		sendToken(req, res);
		res.status(200).json({ result: 'OK' });
	};
}

export function firebaseAuthRoutesBuilder({
	domain,
	configModule,
	authPath,
	strategyName,
	expiresIn,
}: {
	domain: 'admin' | 'store';
	configModule: ConfigModule;
	authPath: string;
	strategyName: string;
	expiresIn?: number;
}): Router {
	const router = Router();

	const corsOptions = {
		origin:
			domain === 'admin'
				? configModule.projectConfig.admin_cors.split(',')
				: configModule.projectConfig.store_cors.split(','),
		credentials: true,
	};

	router.get(authPath, cors(corsOptions));
	/*necessary if you are using non medusajs client such as a pure axios call, axios initially requests options and then get*/
	router.options(authPath, cors(corsOptions));

	const callbackHandler = firebaseCallbackMiddleware(
		domain,
		configModule.projectConfig.jwt_secret,
		expiresIn ?? TWENTY_FOUR_HOURS_IN_MS
	);

	router.get(
		authPath,
		passport.authenticate(strategyName, {
			session: false,
		}),
		callbackHandler
	);

	return router;
}

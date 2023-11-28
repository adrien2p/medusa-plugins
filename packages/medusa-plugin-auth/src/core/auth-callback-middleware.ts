import { Request, Response } from 'express';
import { ConfigModule } from '@medusajs/medusa/dist/types/global';
import jwt from 'jsonwebtoken';

/**
 * Return the handler of the auth callback for an auth strategy. Once the auth is successful this callback
 * will be called.
 * @param successAction
 */
export function authCallbackMiddleware(successAction: (req: Request, res: Response) => void) {
	return (req, res) => {
		successAction(req, res);
	};
}

export function signToken(domain: 'admin' | 'store', configModule: ConfigModule, user: any, expiresIn?: number) {
	if (domain === 'admin') {
		return jwt.sign({ user_id: user.id, domain: 'admin' }, configModule.projectConfig.jwt_secret, {
			expiresIn: expiresIn ?? '24h',
		});
	} else {
		return jwt.sign({ customer_id: user.id, domain: 'store' }, configModule.projectConfig.jwt_secret, {
			expiresIn: expiresIn ?? '30d',
		});
	}
}

export function authenticateSessionFactory(domain: 'admin' | 'store') {
	return (req, res) => {
		const sessionKey = domain === 'admin' ? 'user_id' : 'customer_id';

		req.session[sessionKey] = req.user.id;
	};
}

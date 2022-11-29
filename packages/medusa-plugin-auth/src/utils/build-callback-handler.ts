import jwt from 'jsonwebtoken';
import { getCookieOptions } from './get-cookie-options';

export function buildCallbackHandler(tokenName: string, secret: string, expiresIn: number, successRedirect: string) {
	return (req, res) => {
		const token = jwt.sign({ customer_id: req.user.id }, secret, {
			expiresIn,
		});
		res.cookie(tokenName, token, getCookieOptions(expiresIn)).redirect(successRedirect);
	};
}

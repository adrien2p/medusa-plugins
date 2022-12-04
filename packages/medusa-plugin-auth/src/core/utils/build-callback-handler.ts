import jwt from 'jsonwebtoken';
import { getCookieOptions } from './get-cookie-options';

export function buildCallbackHandler(domain: "admin" | "store", cookieName: string, secret: string, expiresIn: number, successRedirect: string) {
	return (req, res) => {
		const tokenData = domain === "admin" ? { userId: req.user.id } : { customer_id: req.user.id }
		const token = jwt.sign(tokenData, secret, { expiresIn });
		res.cookie(cookieName, token, getCookieOptions(expiresIn)).redirect(successRedirect);
	};
}

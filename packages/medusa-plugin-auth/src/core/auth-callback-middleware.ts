import jwt from 'jsonwebtoken';

/**
 * Return the handler of the auth callback for an auth strategy. Once the auth is successful this callback
 * will be called.
 * @param domain
 * @param secret
 * @param expiresIn
 * @param successRedirect
 */
export function authCallbackMiddleware(
	domain: 'admin' | 'store',
	secret: string,
	expiresIn: number,
	successRedirect: string
) {
	return (req, res) => {
		const tokenData = domain === 'admin' ? { userId: req.user.id } : { customer_id: req.user.id };
		const token = jwt.sign(tokenData, secret, { expiresIn });
		const sessionKey = domain === 'admin' ? 'jwt' : 'jwt_store';
		req.session[sessionKey] = token;
		res.redirect(successRedirect);
	};
}

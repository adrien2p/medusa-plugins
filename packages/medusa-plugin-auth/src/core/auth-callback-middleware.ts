import jwt from 'jsonwebtoken';

/**
 * Return the handler of the auth callback for an auth strategy. Once the auth is successful this callback
 * will be called.
 * @param domain
 * @param secret
 * @param expiresIn
 * @param successRedirectGetter
 */
export function authCallbackMiddleware(
	domain: 'admin' | 'store',
	secret: string,
	expiresIn: number,
	successRedirectGetter: () => string
) {
	return (req, res) => {
		const sendToken = sendTokenFactory(domain, secret, expiresIn);
		sendToken(req, res);
		res.redirect(successRedirectGetter());
	};
}

export function sendTokenFactory(domain: 'admin' | 'store', secret: string, expiresIn: number) {
	return (req, res) => {
		const tokenData =
			domain === 'admin' ? { userId: req.user.id, ...req.user } : { customer_id: req.user.id, ...req.user };
		const token = jwt.sign(tokenData, secret, { expiresIn });
		const sessionKey = domain === 'admin' ? 'jwt' : 'jwt_store';
		req.session[sessionKey] = token;
	};
}

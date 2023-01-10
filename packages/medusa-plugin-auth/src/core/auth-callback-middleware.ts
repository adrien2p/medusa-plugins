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
		const sendToken = sendTokenFactory(domain, secret, expiresIn);
		sendToken(req, res);
		res.redirect(successRedirect);
	};
}

export function firebaseCallbackMiddleware(
	domain: 'admin' | 'store',
	secret: string,
	expiresIn: number,
	successRedirect: string,
	enableRedirects: boolean,
) {
	if(enableRedirects) {
		return authCallbackMiddleware(domain, secret, expiresIn, successRedirect);
	}

	return (req, res) => {
		const sendToken = sendTokenFactory(domain, secret, expiresIn);
		sendToken(req, res);
		res.status(200).json({ result: 'OK' });
	}
}

function sendTokenFactory(
	domain: 'admin' | 'store',
	secret: string,
	expiresIn: number,
) {
	return (req, res) => {
		const tokenData = domain === 'admin' ? { userId: req.user.id } : { customer_id: req.user.id };
		const token = jwt.sign(tokenData, secret, { expiresIn });
		const sessionKey = domain === 'admin' ? 'jwt' : 'jwt_store';
		req.session[sessionKey] = token;
	}
}

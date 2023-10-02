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
	successRedirectGetter: () => string
) {
	return (req, res) => {
		const sendToken = authenticateSession(domain);
		sendToken(req, res);
		res.redirect(successRedirectGetter());
	};
}

export function authenticateSession(domain: 'admin' | 'store') {
	return (req, res) => {
		const sessionKey = domain === 'admin' ? 'user_id': 'customer_id';

		req.session[sessionKey] = req.user.id;
	};
}

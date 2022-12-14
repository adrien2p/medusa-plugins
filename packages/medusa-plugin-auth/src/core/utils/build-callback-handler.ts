import jwt from 'jsonwebtoken';

export function buildCallbackHandler(
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

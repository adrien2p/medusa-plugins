import crypto from 'crypto';

export function verifySignature(req, secret: string): boolean {
	const hmac = crypto.createHmac('sha256', secret);
	hmac.update(JSON.stringify(req.body), 'utf8');
	const digest = hmac.digest('hex');
	return digest === req.get('sentry-hook-signature');
}

export function isFunction(val: unknown): val is Function {
	return val != null && typeof val === 'function';
}

import * as crypto from 'crypto';
import { Cart, PaymentSession } from '@medusajs/medusa/dist';
import * as FormData from 'form-data';
import { IncomingMessage } from 'http';
import { MerchantConfig, PayTrResponse } from './types';
import ipaddr = require('ipaddr.js');

export function buildAddressFromCart(cart: Cart): string | never {
	if (!cart?.billing_address) {
		throw new Error('Missing billing address from cart.');
	}

	return [
		cart.billing_address?.company ?? '',
		cart.billing_address?.address_1 ?? '',
		cart.billing_address?.address_2 ?? '',
		cart.billing_address?.city ?? '',
		cart.billing_address?.postal_code ?? '',
		cart.billing_address?.country ?? '',
		cart.billing_address?.province ?? '',
		cart.billing_address?.phone ?? '',
	]
		.join(' ')
		.trim();
}

const PAYTR_ORDER_PREFIX = 'PAYTRMED';

export function buildOid(id: string): string {
	return PAYTR_ORDER_PREFIX + id;
}

export function getCartIdFromOid(oid: string): string {
	return ['cart_', oid.replace(PAYTR_ORDER_PREFIX, '')].join('');
}

export function buildPaymentToken({
	orderId,
	email,
	amount,
	ip,
	cartToken,
	currency_code,
	merchantConfig,
}: {
	orderId: string;
	email: string;
	amount: number;
	ip: string;
	cartToken: string;
	currency_code: string;
	merchantConfig: Partial<MerchantConfig>;
}): string {
	const body =
		merchantConfig.merchant_id +
		ip +
		orderId +
		email +
		amount +
		cartToken +
		merchantConfig.no_installment +
		merchantConfig.max_installment +
		currency_code +
		merchantConfig.test_mode;
	return buildPaytrToken(body + merchantConfig.merchant_salt, {
		merchant_key: merchantConfig.merchant_key,
	});
}

export function buildPaytrToken(body: string, { merchant_key }: { merchant_key: string }) {
	return crypto.createHmac('sha256', merchant_key).update(body).digest('base64');
}

export function convertIpToIpv4(ip: string): string {
	let result = ip;

	if (ip === '::1') {
		return '127.0.0.1';
	}

	const addr = ipaddr.parse(ip);
	if (addr.kind() === 'ipv6') {
		result = (addr as ipaddr.IPv6).toIPv4Address().toString();
	}

	return result;
}

export function findPendingPaymentSession(
	paymentsSessions: PaymentSession[],
	{ merchantOid }: { merchantOid: string }
): PaymentSession {
	return paymentsSessions.find(
		(session) =>
			session.provider_id === 'paytr' &&
			session.data.merchantOid === merchantOid &&
			session.data.isPending === true
	);
}

export function request(endpoint: string, data: Record<string, unknown>): Promise<string> {
	const formData = new FormData();
	Object.entries(data).forEach(([key, value]) => {
		formData.append(key, value ?? '');
	});
	return new Promise((resolve, reject) => {
		formData.submit(endpoint, (err: Error | null, res: IncomingMessage) => {
			if (err) {
				return reject(err);
			}
			const resBodyChunks = [];
			res.setEncoding('utf8');
			res.on('data', (chunk) => {
				resBodyChunks.push(chunk);
			});
			res.on('end', () => {
				const resBody = resBodyChunks.join('').toString() || '{}';
				const parsedRes: PayTrResponse = JSON.parse(resBody);
				if (parsedRes.status === 'failed') {
					return reject((parsedRes as PayTrResponse<'failed'>).reason);
				}
				return resolve(parsedRes.token);
			});
		});
	});
}

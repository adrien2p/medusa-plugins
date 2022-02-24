"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = exports.findPendingPaymentSession = exports.convertIpToIpv4 = exports.buildPaytrToken = exports.buildPaymentToken = exports.buildOid = exports.buildAddressFromCart = void 0;
const crypto = require("crypto");
const FormData = require("form-data");
const ipaddr = require("ipaddr.js");
function buildAddressFromCart(cart) {
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
        cart.billing_address?.phone ?? ''
    ].join(' ').trim();
}
exports.buildAddressFromCart = buildAddressFromCart;
const PAYTR_ORDER_PREFIX = 'PAYTRMED';
function buildOid(id) {
    return PAYTR_ORDER_PREFIX + id;
}
exports.buildOid = buildOid;
function buildPaymentToken({ orderId, email, amount, ip, cartToken, currency_code, merchantConfig }) {
    const body = merchantConfig.merchant_id
        + ip
        + orderId
        + email
        + amount
        + cartToken
        + merchantConfig.no_installment
        + merchantConfig.max_installment
        + currency_code
        + merchantConfig.test_mode;
    return buildPaytrToken(body + merchantConfig.merchant_salt, {
        merchant_key: merchantConfig.merchant_key,
        merchant_salt: merchantConfig.merchant_salt
    });
}
exports.buildPaymentToken = buildPaymentToken;
function buildPaytrToken(body, { merchant_key, merchant_salt }) {
    return crypto
        .createHmac('sha256', merchant_key)
        .update(body + merchant_salt)
        .digest('base64');
}
exports.buildPaytrToken = buildPaytrToken;
function convertIpToIpv4(ip) {
    let result = ip;
    if (ip === '::1') {
        return '127.0.0.1';
    }
    const addr = ipaddr.parse(ip);
    if (addr.kind() === 'ipv6') {
        result = addr.toIPv4Address().toString();
    }
    return result;
}
exports.convertIpToIpv4 = convertIpToIpv4;
async function findPendingPaymentSession(paymentsSessions, { merchantOid }) {
    return paymentsSessions.find(session => (session.provider_id === 'paytr'
        && session.data.merchantOid === merchantOid && session.data.cart)
        && session.data.isPending === true
        && session.data.status === -1);
}
exports.findPendingPaymentSession = findPendingPaymentSession;
function request(endpoint, data) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value ?? '');
    });
    return new Promise((resolve, reject) => {
        formData.submit(endpoint, ((err, res) => {
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
                const parsedRes = JSON.parse(resBody);
                if (parsedRes.status === 'failed') {
                    return reject(parsedRes.reason);
                }
                return resolve(parsedRes.token);
            });
        }));
    });
}
exports.request = request;

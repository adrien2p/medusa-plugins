"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
function buildPaytrToken({ orderId, email, amount, ip, cartToken, currency_code, merchantConfig }) {
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
    return crypto
        .createHmac('sha256', merchantConfig.merchant_key)
        .update(body + merchantConfig.merchant_salt)
        .digest('base64');
}
exports.default = buildPaytrToken;

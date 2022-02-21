import { MerchantConfig } from "../types";
import * as crypto from "crypto";

export default function buildPaytrToken(
    {
        orderId,
        email,
        amount,
        ip,
        cartToken,
        currency_code,
        merchantConfig
    }: {
        orderId: string;
        email: string;
        amount: number;
        ip: string;
        cartToken: string;
        currency_code: string;
        merchantConfig: Partial<MerchantConfig>
    }
): string {
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
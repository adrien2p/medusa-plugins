import { Request } from "express";

export type MerchantConfig = {
    token_endpoint: string;
    merchant_id: string;
    merchant_key: string;
    merchant_salt: string;
    merchant_ok_url: string;
    merchant_fail_url: string;
    debug_on: 0 | 1;
    test_mode: 0 | 1;
    no_installment: 0 | 1;
    max_installment: 0 | 1;
    timeout_limit: number;
};

export type PayTrResponse<TStatus = 'success' | 'failed'> = {
    status: TStatus;
    token: TStatus extends 'success' ? string : never;
    reason: TStatus extends 'failed' ? string : never;
};

export type PaymentSessionData = {
    status: number;
    isPending: boolean;
    merchantOid: string;
};

export type CustomRequest = Request & { scope: { resolve: <T>(name: string) => T } };
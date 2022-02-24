import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as dotenv from 'dotenv';

try {
    dotenv.config({ path: __dirname + '/../../../.env.test' });
} catch (e) {}

import PayTRProviderService from "../paytr-provider";
import { CustomerServiceMock } from "../../__mock__/customer";
import { TotalsServiceMock } from "../../__mock__/totals";
import { cartMockData, CartServiceMock } from "../../__mock__/cart";

const merchantConfig: any = {
    token_endpoint: process.env.TOKEN_ENDPOINT,
    refund_endpoint: process.env.REFUND_ENDPOINT,
    debug_on: 1,
    test_mode: 1,
    max_installment: 0,
    no_installment: 0,
    merchant_fail_url: 'http://localhost:3000/pay-tr/success',
    merchant_ok_url: 'http://localhost:3000/pay-tr/fail',
    merchant_id: process.env.MERCHANT_ID,
    merchant_key: process.env.MERCHANT_KEY,
    merchant_salt: process.env.MERCHANT_SALT,
    timeout_limit: 30
};

const RegionServiceMock = {
    retrieve: jest.fn().mockReturnValue(Promise.resolve({ currency_code: 'TL' }))
};

const OrderServiceMock = {
    retrieveByCartId: jest.fn().mockReturnValue(Promise.resolve({ id: 'or_dzlkfzengzelkgvnz' }))
};

describe('PayTrProvider', () => {
    let provider: PayTRProviderService;

    beforeAll(async () => {
        jest.clearAllMocks();
        provider = new PayTRProviderService(
            {
                cartService: CartServiceMock,
                customerService: CustomerServiceMock,
                regionService: RegionServiceMock,
                totalsService: TotalsServiceMock,
                orderService: OrderServiceMock
            },
            merchantConfig
        );
        PayTRProviderService.prototype.retrieveCart = jest.fn().mockReturnValue(Promise.resolve(cartMockData));
    });

    it('should allow to generate a new token', async () => {
        const token = await provider.generateToken(cartMockData.id);
        expect(token).toBeDefined();
    });
});
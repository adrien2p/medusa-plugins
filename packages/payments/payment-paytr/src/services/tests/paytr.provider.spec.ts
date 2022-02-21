import 'core-js/stable';
import 'regenerator-runtime/runtime';

import PayTRProviderService from "../paytr-provider";
import { CustomerServiceMock } from "../../__mock__/customer";
import { TotalsServiceMock } from "../../__mock__/totals";
import { IdMap } from "medusa-test-utils";
import { CartServiceMock } from "../../__mock__/cart";

const merchantConfig: any = {
    token_endpoint: process.env.TOKEN_ENDPOINT,
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

const cartMockData = {
    id: IdMap.getId("emptyCart"),
    region_id: 'region_1',
    customer: {
        email: 'example@mail.com',
        phone: '0000000000',
        billing_address: {
            first_name: "LeBron",
            last_name: "James",
            address_1: "Dunk St",
            city: "Dunkville",
            province: "CA",
            postal_code: "12345",
            country_code: "us",
        }
    },
    items: [
        {
            title: "New Line",
            description: "This is a new line",
            thumbnail: "test-img-yeah.com/thumb",
            variant_id: 'variant_1',
            unit_price: 123,
            quantity: 10,
        }
    ]
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
        jest.clearAllMocks()
        provider = new PayTRProviderService(
            {
                cartService: CartServiceMock,
                customerService: CustomerServiceMock,
                regionService: RegionServiceMock,
                totalsService: TotalsServiceMock,
                orderService: OrderServiceMock
            },
            merchantConfig
        )
    });

    it('should allow to create a payment', async () => {
        const token = await provider.generateToken(cartMockData.id);
        expect(token).toBeDefined();
    });
});
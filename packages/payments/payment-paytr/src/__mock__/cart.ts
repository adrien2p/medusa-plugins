import { IdMap } from "medusa-test-utils"

export const cartMockData = {
    id: IdMap.getId("mockCart"),
    region_id: 'region_1',
    customer: {
        email: 'example@mail.com'
    },
    billing_address: {
        first_name: "LeBron",
        last_name: "James",
        address_1: "Dunk St",
        city: "Dunkville",
        province: "CA",
        postal_code: "12345",
        country_code: "us",
        phone: '0000000000'
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
    ],
    metadata: {
        ip: 'XX.XXX.XXX.XX'
    }
};

export const CartServiceMock = {
    retrieve: jest.fn().mockImplementation((cartId) => {
        return Promise.resolve(cartMockData);
    }),
    updatePaymentSession: jest
        .fn()
        .mockImplementation((cartId, stripe, paymentIntent) => {
            return Promise.resolve();
        }),
}

const mock = jest.fn().mockImplementation(() => {
    return CartServiceMock
});

export default mock;

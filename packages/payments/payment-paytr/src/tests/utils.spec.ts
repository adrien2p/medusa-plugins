import { buildAddressFromCart, buildOid, getCartIdFromOid } from "../utils";
import { cartMockData } from "../__mock__/cart";
import { Cart } from "@medusajs/medusa/dist";

const PAYTR_ORDER_PREFIX = 'PAYTRMED';

describe('Utils', () => {
    it('should build the address from the cart', () => {
        const builtAddress = buildAddressFromCart(cartMockData as Cart);
        expect(builtAddress).toBe('Dunk St  Dunkville 12345  CA 0000000000');
    });

    it('should build a merchant_oid from and id', () => {
        const formattedCartId = cartMockData.id.split('_').pop();
        const oid = buildOid(formattedCartId);
        const expectedOid = `${PAYTR_ORDER_PREFIX}${formattedCartId}`;
        expect(oid).toBe(expectedOid);
        expect(oid).not.toBe(cartMockData.id);
    });

    it('should revert merchant_oid to the right cart id', () => {
        const merchantOid = `${PAYTR_ORDER_PREFIX}${cartMockData.id.split('_').pop()}`;
        const cartId = getCartIdFromOid(merchantOid);
        expect(cartId).toBe(cartMockData.id);
        expect(cartId).not.toBe(`${PAYTR_ORDER_PREFIX}${cartMockData.id.split('_').pop()}`);
    });
});
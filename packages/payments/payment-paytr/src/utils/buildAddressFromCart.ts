import { Cart } from "@medusajs/medusa/dist";

export default function buildAddressFromCart(cart: Cart): string | never {
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
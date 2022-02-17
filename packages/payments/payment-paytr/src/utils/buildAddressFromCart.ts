import { Cart } from "@medusajs/medusa/dist";

export default function buildAddressFromCart(cart: Cart): string {
    return [
        cart?.customer.billing_address.company,
        cart?.customer.billing_address.address_1,
        cart?.customer.billing_address.address_2,
        cart?.customer.billing_address.city,
        cart?.customer.billing_address.postal_code,
        cart?.customer.billing_address.country,
        cart?.customer.billing_address.province,
        cart?.customer.billing_address.phone
    ].join(' ');
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function buildAddressFromCart(cart) {
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
exports.default = buildAddressFromCart;

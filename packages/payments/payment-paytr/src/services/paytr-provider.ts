import * as CryptoJS from 'crypto-js';
import OrderService from "@medusajs/medusa/dist/services/order";
import TotalsService from "@medusajs/medusa/dist/services/totals";
import { Cart, Payment } from "@medusajs/medusa/dist";
import { CustomerService, RegionService } from "@medusajs/medusa/dist/services";
import { PaymentService } from "medusa-interfaces";
import { PaymentSessionStatus } from "@medusajs/medusa/dist/models/payment-session";
import { MerchantConfig } from "../types";
import buildAddressFromCart from "../utils/buildAddressFromCart";
import request from "../utils/request";

type PaymentData = Record<string, unknown>;
type PaymentSessionData = Record<string, unknown>;

export default class PayTRProviderService extends PaymentService {
    static identifier = "paytr";

    #merchantConfig: MerchantConfig;

    #orderService: OrderService;
    #customerService: CustomerService;
    #regionService: RegionService;
    #totalsService: TotalsService;

    constructor({ customerService, totalsService, regionService, orderService }, options: MerchantConfig) {
        super();

        this.#merchantConfig = options;

        this.#orderService = orderService;
        this.#customerService = customerService;
        this.#regionService = regionService;
        this.#totalsService = totalsService;
    }

    async createPayment(cart: Cart): Promise<PaymentSessionData> {
        const amount = await this.#totalsService.getTotal(cart);
        const { currency_code } = await this.#regionService.retrieve(cart.region_id);
        const { id: orderId } = await this.#orderService.retrieveByCartId(cart.id);
        const formattedOrderId = orderId.replace('_', '');
        const formattedItems = cart.items.map(item => {
            return [item.title, item.unit_price, item.quantity];
        });
        const cartToken = btoa(decodeURI(encodeURIComponent(JSON.stringify(formattedItems))));
        const payTrToken = this.buildPayTrKey({
            amount,
            email: cart?.customer.email,
            ip: cart?.metadata?.ip ?? 'xxx.x.xxx.xxx',
            currency_code,
            orderId: formattedOrderId,
            cartToken
        });
        const billingAddress = buildAddressFromCart(cart);
        const { token_endpoint, merchant_key, merchant_salt, ...config } = this.#merchantConfig;
        const data = {
            ...config,
            paytr_token: payTrToken,
            no_installment: this.#merchantConfig.no_installment,
            max_installment: this.#merchantConfig.max_installment,
            payment_amount: amount,
            currency: currency_code,
            user_name: cart?.customer?.billing_address.first_name + ' ' + cart?.customer?.billing_address.last_name,
            user_address: billingAddress,
            email: cart?.customer.email,
            user_phone: cart?.customer.phone,
            user_ip: cart?.metadata?.ip ?? 'xxx.x.xxx.xxx',
            user_basket: cartToken,
            merchant_oid: formattedOrderId,
            lang: cart?.customer?.metadata?.lang ?? 'tr',
        };

        try {
            const token = await request(token_endpoint, data);
            return {
                id: 'pi_' + cartToken,
                cart_id: cart.id,
                amount,
                currency_code,
                ip: cart?.metadata?.ip ?? 'xxx.x.xxx.xxx',
                data: {
                    token,
                    status: -1
                },
            };
        } catch (e) {
            throw new Error(`An error occurred while trying to create the payment.\n${e?.message}`);
        }
    }

    async getStatus(payment: Payment): Promise<PaymentSessionStatus> {
        const { data: { status } } = payment;

        if (status === -1) {
            return PaymentSessionStatus.REQUIRES_MORE;
        }

        const errorStatusCodes = [0, 1, 2, 3, 6, 9, 11, 99];

        if (errorStatusCodes.includes(status)) {
            return PaymentSessionStatus.ERROR;
        }

        return PaymentSessionStatus.AUTHORIZED;
    }

    async retrievePayment(data: unknown): Promise<unknown> {
        return data;
    }

    async getPaymentData(sessionData: { data: unknown }): Promise<unknown> {
        return sessionData.data;
    }

    async authorizePayment(): Promise<{ status: string; data: { status: string; } }> {
        return { status: "authorized", data: { status: "authorized" } };
    }

    async updatePayment(sessionData: { data: unknown; }, updateData: unknown): Promise<unknown> {
        console.log(updateData);
        return sessionData.data;
    }

    async deletePayment(): Promise<void> {
        return;
    }

    async capturePayment() {
        return { status: "captured" }
    }

    async refundPayment(payment: { data: unknown }): Promise<unknown> {
        return payment.data;
    }

    async cancelPayment(): Promise<{ status: string; }> {
        return { status: "canceled" };
    }

    private buildPayTrKey(
        {
            orderId,
            email,
            amount,
            ip,
            cartToken,
            currency_code
        }: {
            orderId: string;
            email: string;
            amount: number;
            ip: string;
            cartToken: string;
            currency_code: string;
        }
    ): string {
        const body = this.#merchantConfig.merchant_id
            + ip
            + orderId
            + email
            + amount
            + cartToken
            + this.#merchantConfig.no_installment
            + this.#merchantConfig.max_installment
            + currency_code
            + this.#merchantConfig.test_mode;
        const hash = CryptoJS.HmacSHA256(body + this.#merchantConfig.merchant_salt, this.#merchantConfig.merchant_key);
        return CryptoJS.enc.Base64.stringify(hash);
    }
}
import OrderService from '@medusajs/medusa/dist/services/order';
import TotalsService from '@medusajs/medusa/dist/services/totals';
import { Cart, Payment, PaymentSession } from '@medusajs/medusa/dist';
import { CustomerService, RegionService } from '@medusajs/medusa/dist/services';
import { PaymentService } from 'medusa-interfaces';
import { PaymentSessionStatus } from '@medusajs/medusa/dist/models/payment-session';
import { MerchantConfig, PaymentData, PaymentSessionData } from '../types';
import CartService from '@medusajs/medusa/dist/services/cart';
import * as nodeBase64 from 'nodejs-base64-converter';
import { EntityManager } from 'typeorm';
import {
	buildAddressFromCart,
	buildOid,
	buildPaymentToken,
	buildPaytrToken,
	findPendingPaymentSession,
	getCartIdFromOid,
	request,
} from '../utils';
import { PaymentSessionRepository } from '@medusajs/medusa/dist/repositories/payment-session';

export default class PayTRProviderService extends PaymentService {
	static identifier = 'paytr';

	readonly #merchantConfig: MerchantConfig;

	readonly #manager: EntityManager;
	readonly #paymentSessionRepository: typeof PaymentSessionRepository;
	readonly #orderService: OrderService;
	readonly #customerService: CustomerService;
	readonly #regionService: RegionService;
	readonly #totalsService: TotalsService;
	readonly #cartService: CartService;

	constructor(
		{ manager, paymentSessionRepository, cartService, customerService, totalsService, regionService, orderService },
		options: MerchantConfig
	) {
		super();

		this.#merchantConfig = options;

		this.#manager = manager;
		this.#paymentSessionRepository = paymentSessionRepository;
		this.#orderService = orderService;
		this.#customerService = customerService;
		this.#regionService = regionService;
		this.#totalsService = totalsService;
		this.#cartService = cartService;
	}

	async generateToken(cartId: string): Promise<string | never> {
		const cart = await this.retrieveCart(cartId);
		const amount = await this.#totalsService.getTotal(cart);
		const { currency_code } = await this.#regionService.retrieve(cart.region_id);
		const formattedItems = cart.items.map((item) => [item.title, item.unit_price, item.quantity.toString()]);
		const cartToken = nodeBase64.encode(JSON.stringify(formattedItems));
		const userIp = cart.context?.ip ?? 'xxx.x.xxx.xxx';
		const merchantOid = buildOid(cart.id.split('_').pop());
		const payTrToken = await buildPaymentToken({
			amount,
			orderId: merchantOid,
			email: cart.customer?.email,
			ip: userIp,
			currency_code,
			cartToken,
			merchantConfig: this.#merchantConfig,
		});
		const billingAddress = buildAddressFromCart(cart);
		/* eslint-disable @typescript-eslint/no-unused-vars */
		const { token_endpoint, refund_endpoint, ...config } = this.#merchantConfig;
		const data = {
			...config,
			paytr_token: payTrToken,
			no_installment: this.#merchantConfig.no_installment,
			max_installment: this.#merchantConfig.max_installment,
			payment_amount: amount,
			currency: currency_code,
			user_name: (cart?.billing_address?.first_name + ' ' + cart?.billing_address?.last_name).trim(),
			user_address: billingAddress,
			email: cart.customer?.email,
			user_phone: cart.billing_address?.phone,
			user_ip: userIp,
			user_basket: cartToken,
			merchant_oid: merchantOid,
			lang: cart.customer?.metadata?.lang ?? 'tr',
		};

		try {
			return await request(token_endpoint, data);
		} catch (e) {
			throw new Error(`An error occurred while trying to create the payment.\n${e?.message ?? e}`);
		}
	}

	async createPayment(cart: Cart): Promise<PaymentSessionData> {
		const merchantOid = buildOid(cart.id.split('_').pop());
		return { merchantOid, isPending: true };
	}

	async getStatus(data: PaymentData): Promise<PaymentSessionStatus> {
		const { status } = data as { status: string | null };

		if (!status) {
			return PaymentSessionStatus.PENDING;
		}

		return status === 'success' ? PaymentSessionStatus.AUTHORIZED : PaymentSessionStatus.ERROR;
	}

	async getPaymentData(sessionData: { data: PaymentSessionData }): Promise<PaymentSessionData> {
		return sessionData.data;
	}

	async authorizePayment(paymentSession: PaymentSession): Promise<{ status: string; data: PaymentSessionData }> {
		return { status: 'authorized', data: paymentSession.data };
	}

	async updatePayment(
		sessionData: { data: PaymentSessionData },
		updateData: PaymentSessionData
	): Promise<PaymentSessionData> {
		return {
			...sessionData.data,
			...updateData,
		};
	}

	async deletePayment(): Promise<void> {
		return;
	}

	async capturePayment(payment: Payment): Promise<PaymentData> {
		return payment.data;
	}

	async refundPayment(payment: Payment, refundAmount: number): Promise<PaymentData> {
		const tokenBody =
			this.#merchantConfig.merchant_id +
			payment.data.merchantOid +
			refundAmount +
			this.#merchantConfig.merchant_salt;
		const token = buildPaytrToken(tokenBody, { merchant_key: this.#merchantConfig.merchant_key });

		await request(this.#merchantConfig.refund_endpoint, {
			merchant_id: this.#merchantConfig.merchant_id,
			merchant_oid: payment.data.merchantOid,
			return_amount: refundAmount,
			paytr_token: token,
		});

		return payment.data;
	}

	async cancelPayment(payment: Payment): Promise<PaymentData> {
		return payment.data;
	}

	public async handleCallback({
		merchant_oid,
		status,
		total_amount,
		hash,
	}: {
		merchant_oid: string;
		status: 'success' | 'error';
		total_amount: number;
		hash: string;
	}): Promise<void | never> {
		const tokenBody = merchant_oid + this.#merchantConfig.merchant_salt + status + total_amount;
		const token = buildPaytrToken(tokenBody, { merchant_key: this.#merchantConfig.merchant_key });

		if (token != hash) {
			throw new Error('PAYTR notification failed: bad hash');
		}

		const cartId = getCartIdFromOid(merchant_oid);
		const cart = await this.retrieveCart(cartId);
		const pendingPaymentSession = findPendingPaymentSession(cart.payment_sessions, {
			merchantOid: merchant_oid,
		});
		if (!pendingPaymentSession) {
			throw new Error('Unable to complete payment session. The payment session was not found.');
		}

		const paymentSessionRepo = this.#manager.getCustomRepository(this.#paymentSessionRepository);
		pendingPaymentSession.data = {
			...pendingPaymentSession.data,
			isPending: !(status === 'success'),
			status,
		};
		await paymentSessionRepo.save(pendingPaymentSession);
	}

	async retrieveCart(cartId: string): Promise<Cart> {
		return this.#cartService.retrieve(cartId, {
			select: ['gift_card_total', 'subtotal', 'tax_total', 'shipping_total', 'discount_total', 'total'],
			relations: [
				'items',
				'discounts',
				'discounts.rule',
				'discounts.rule.valid_for',
				'gift_cards',
				'billing_address',
				'shipping_address',
				'region',
				'region.payment_providers',
				'payment_sessions',
				'customer',
			],
		});
	}
}

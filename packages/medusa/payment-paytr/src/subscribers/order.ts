import EventBusService from '@medusajs/medusa/dist/services/event-bus';
import OrderService from '@medusajs/medusa/dist/services/order';
import CartService from '@medusajs/medusa/dist/services/cart';
import PaymentProviderService from '@medusajs/medusa/dist/services/payment-provider';
import { PaymentSessionStatus } from '@medusajs/medusa/dist';

export default class OrderSubscriber {
	readonly #orderService: OrderService;
	readonly #cartService: CartService;
	readonly #paymentProviderService: PaymentProviderService;
	readonly #eventBus: EventBusService;

	constructor({ orderService, cartService, eventBusService, paymentProviderService }) {
		this.#eventBus = eventBusService;
		this.#orderService = orderService;
		this.#paymentProviderService = paymentProviderService;
		this.#cartService = cartService;

		this.#eventBus.subscribe(OrderService.Events.PLACED, async ({ id }) => {
			return await this.onOrderPlaces(id);
		});
	}

	async onOrderPlaces(id: string) {
		const order = await this.#orderService.retrieve(id);
		const cart = await this.#cartService.retrieve(order.cart_id, {
			relations: ['payment'],
		});
		const paymentStatus = await this.#paymentProviderService.getStatus(cart.payment);
		if (paymentStatus === PaymentSessionStatus.AUTHORIZED) {
			return await this.#orderService.capturePayment(id);
		}
	}
}

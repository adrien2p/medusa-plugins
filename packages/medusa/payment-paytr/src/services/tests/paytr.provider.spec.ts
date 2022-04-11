import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as dotenv from 'dotenv';

try {
	dotenv.config({ path: __dirname + '/../../../.env.test' });
} catch (e) {}

import { MockManager, MockRepository } from 'medusa-test-utils';
import PayTRProviderService from '../paytr-provider';
import { CustomerServiceMock } from '../../__mock__/customer';
import { TotalsServiceMock } from '../../__mock__/totals';
import { cartMockData, CartServiceMock } from '../../__mock__/cart';
import { MerchantConfig } from '../../types';
import { Cart } from '@medusajs/medusa/dist';
import { buildOid } from '../../utils';
import { PaymentSessionStatus } from '@medusajs/medusa/dist/models/payment-session';

const merchantConfig: MerchantConfig = {
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
	timeout_limit: 30,
};

const RegionServiceMock = {
	retrieve: jest.fn().mockReturnValue(Promise.resolve({ currency_code: 'TL', currency: { symbol: 'TL' } })),
};

const PaymentMockRepository = MockRepository({
	save: jest.fn().mockReturnValue(Promise.resolve()),
});

describe('PayTrProvider', () => {
	let provider: PayTRProviderService;

	beforeAll(async () => {
		jest.clearAllMocks();
		provider = new PayTRProviderService(
			{
				manager: MockManager,
				paymentSessionRepository: PaymentMockRepository,
				cartService: CartServiceMock,
				customerService: CustomerServiceMock,
				regionService: RegionServiceMock,
				totalsService: TotalsServiceMock,
			},
			merchantConfig
		);
		PayTRProviderService.prototype.retrieveCart = jest.fn().mockReturnValue(Promise.resolve(cartMockData));
	});

	it('should allow to generate a new token', async () => {
		const token = await provider.generateToken(cartMockData.id);
		expect(token).toBeDefined();
	});

	it('should return the corresponding data on create payment', async () => {
		const data = await provider.createPayment(cartMockData as Cart);
		expect(data.merchantOid).toBe(buildOid(cartMockData.id.split('_').pop()));
	});

	it('should return the appropriate status', async () => {
		let status = await provider.getStatus({ status: null });
		expect(status).toBe(PaymentSessionStatus.PENDING);

		status = await provider.getStatus({ status: 'success' });
		expect(status).toBe(PaymentSessionStatus.AUTHORIZED);

		status = await provider.getStatus({ status: 'rejected' });
		expect(status).toBe(PaymentSessionStatus.ERROR);
	});
});

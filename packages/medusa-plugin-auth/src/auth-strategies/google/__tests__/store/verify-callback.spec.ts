import { GoogleStoreStrategy } from '../../store';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AUTH_PROVIDER_KEY, CUSTOMER_METADATA_KEY } from '../../../../types';
import { GoogleAuthOptions, GOOGLE_STORE_STRATEGY_NAME, Profile } from '../../types';

describe('Google store strategy verify callback', function () {
	const existsEmail = 'exists@test.fr';
	const existsEmailWithMeta = 'exist2s@test.fr';
	const existsEmailWithMetaAndProviderKey = 'exist3s@test.fr';
	const existsEmailWithMetaButWrongProviderKey = 'exist4s@test.fr';

	let container: MedusaContainer;
	let req: Request;
	let accessToken: string;
	let refreshToken: string;
	let profile: Profile;
	let googleStoreStrategy: GoogleStoreStrategy;

	beforeEach(() => {
		profile = {
			emails: [{ value: existsEmail }],
		};

		container = {
			resolve: <T>(name: string): T => {
				const container_ = {
					manager: {
						transaction: function (cb) {
							return cb();
						},
					},
					customerService: {
						withTransaction: function () {
							return this;
						},
						update: jest.fn().mockImplementation(async (customerId: string, update: any) => {
							return { id: 'test' };
						}),
						create: jest.fn().mockImplementation(async () => {
							return { id: 'test' };
						}),
						retrieveRegisteredByEmail: jest.fn().mockImplementation(async (email: string) => {
							if (email === existsEmail) {
								return {
									id: 'test',
								};
							}

							if (email === existsEmailWithMeta) {
								return {
									id: 'test2',
									metadata: {
										[CUSTOMER_METADATA_KEY]: true,
									},
								};
							}

							if (email === existsEmailWithMetaAndProviderKey) {
								return {
									id: 'test3',
									metadata: {
										[CUSTOMER_METADATA_KEY]: true,
										[AUTH_PROVIDER_KEY]: GOOGLE_STORE_STRATEGY_NAME
									},
								};
							}

							if (email === existsEmailWithMetaButWrongProviderKey) {
								return {
									id: 'test4',
									metadata: {
										[CUSTOMER_METADATA_KEY]: true,
										[AUTH_PROVIDER_KEY]: 'fake_provider_key'
									},
								};
							}

							return;
						}),
					},
				};

				return container_[name];
			},
		} as MedusaContainer;

		googleStoreStrategy = new GoogleStoreStrategy(
			container,
			{} as ConfigModule,
			{ clientID: 'fake', clientSecret: 'fake', store: {} } as GoogleAuthOptions
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should succeed', async () => {
		profile = {
			emails: [{ value: existsEmailWithMetaAndProviderKey }],
		};

		const data = await googleStoreStrategy.validate(req, accessToken, refreshToken, profile);
		expect(data).toEqual(
			expect.objectContaining({
				id: 'test3',
			})
		);
	});

	it('should fail when the customer exists without the metadata', async () => {
		profile = {
			emails: [{ value: existsEmail }],
		};

		const err = await googleStoreStrategy.validate(req, accessToken, refreshToken, profile).catch((err) => err);
		expect(err).toEqual(new Error(`Customer with email ${existsEmail} already exists`));
	});

	it('should set AUTH_PROVIDER_KEY when CUSTOMER_METADATA_KEY exists but AUTH_PROVIDER_KEY does not', async () => {
		profile = {
			emails: [{ value: existsEmailWithMeta }],
		};

		const data = await googleStoreStrategy.validate(req, accessToken, refreshToken, profile);
		expect(data).toEqual(
			expect.objectContaining({
				id: 'test2',
			})
		);

		// @TODO - expect(container.customerService.update) to have been called
	});

	it('should fail when the metadata exists but auth provider key is wrong', async () => {
		profile = {
			emails: [{ value: existsEmailWithMetaButWrongProviderKey }],
		};

		const err = await googleStoreStrategy.validate(req, accessToken, refreshToken, profile).catch((err) => err);
		expect(err).toEqual(new Error(`Customer with email ${existsEmailWithMetaButWrongProviderKey} already exists`));
	});

	it('should succeed and create a new customer if it has not been found', async () => {
		profile = {
			emails: [{ value: 'fake' }],
			name: {
				givenName: 'test',
				familyName: 'test',
			},
		};

		const data = await googleStoreStrategy.validate(req, accessToken, refreshToken, profile);
		expect(data).toEqual(
			expect.objectContaining({
				id: 'test',
			})
		);
	});
});

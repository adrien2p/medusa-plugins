import { Auth0StoreStrategy } from '../../store';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AuthOptions, AUTH_PROVIDER_KEY, CUSTOMER_METADATA_KEY } from '../../../../types';
import { Auth0Options, AUTH0_STORE_STRATEGY_NAME, Profile, ExtraParams } from '../../types';

describe('Auth0 store strategy verify callback', function () {
	const existsEmail = 'exists@test.fr';
	const existsEmailWithMeta = 'exist2s@test.fr';
	const existsEmailWithMetaAndProviderKey = 'exist3s@test.fr';
	const existsEmailWithMetaButWrongProviderKey = 'exist4s@test.fr';

	let container: MedusaContainer;
	let req: Request;
	let accessToken: string;
	let refreshToken: string;
	let profile: Profile;
	let extraParams: ExtraParams;
	let auth0StoreStrategy: Auth0StoreStrategy;

	beforeEach(() => {
		profile = {
			emails: [{ value: existsEmail }],
		};
		
		extraParams = {};

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
						create: jest.fn().mockImplementation(async () => {
							return { id: 'test' };
						}),
						retrieveByEmail: jest.fn().mockImplementation(async (email: string) => {
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
										[AUTH_PROVIDER_KEY]: AUTH0_STORE_STRATEGY_NAME
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

		auth0StoreStrategy = new Auth0StoreStrategy(
			container,
			{} as ConfigModule,
			{ auth0Domain: 'fakeDomain', clientID: 'fake', clientSecret: 'fake', store: { callbackUrl: '/fakeCallbackUrl'} } as Auth0Options
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should succeed', async () => {
		profile = {
			emails: [{ value: existsEmailWithMetaAndProviderKey }],
		};

		const data = await auth0StoreStrategy.validate(req, accessToken, refreshToken, extraParams, profile);
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

		const err = await auth0StoreStrategy.validate(req, accessToken, refreshToken, extraParams, profile).catch((err) => err);
		expect(err).toEqual(new Error(`Customer with email ${existsEmail} already exists`));
	});

	it('should fail when the customer exsits with ONLY customer metadata key', async () => {
		profile = {
			emails: [{ value: existsEmailWithMeta }],
		};

		const err = await auth0StoreStrategy.validate(req, accessToken, refreshToken, extraParams, profile).catch((err) => err);
		expect(err).toEqual(new Error(`Customer with email ${existsEmailWithMeta} already exists`));
	});

	it('should fail when the metadata exists but auth provider key is wrong', async () => {
		profile = {
			emails: [{ value: existsEmailWithMetaButWrongProviderKey }],
		};

		const err = await auth0StoreStrategy.validate(req, accessToken, refreshToken, extraParams, profile).catch((err) => err);
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

		const data = await auth0StoreStrategy.validate(req, accessToken, refreshToken, extraParams, profile);
		expect(data).toEqual(
			expect.objectContaining({
				id: 'test',
			})
		);
	});
});

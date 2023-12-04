import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { getAzureStoreStrategy } from '../../store';
import { AUTH_PROVIDER_KEY, CUSTOMER_METADATA_KEY, IStrategy } from '../../../../types';
import { AZURE_STORE_STRATEGY_NAME, AzureAuthOptions } from '../../types';

describe('Google store strategy verify callback', function () {
	const existsEmail = 'exists@test.fr';
	const existsEmailWithMeta = 'exist2s@test.fr';
	const existsEmailWithMetaAndProviderKey = 'exist3s@test.fr';
	const existsEmailWithMetaButWrongProviderKey = 'exist4s@test.fr';

	let container: MedusaContainer;
	let req: Request;
	let profile: { upn: string; name?: { givenName?: string; familyName?: string } };
	let azureStoreStrategy: IStrategy;
	let updateFn;
	let createFn;

	beforeEach(() => {
		profile = {
			upn: existsEmail,
		};

		updateFn = jest.fn().mockImplementation(async () => {
			return { id: 'test' };
		});
		createFn = jest.fn().mockImplementation(async () => {
			return { id: 'test' };
		});

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
						update: updateFn,
						create: createFn,
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
										[AUTH_PROVIDER_KEY]: AZURE_STORE_STRATEGY_NAME + '_test',
									},
								};
							}

							if (email === existsEmailWithMetaButWrongProviderKey) {
								return {
									id: 'test4',
									metadata: {
										[CUSTOMER_METADATA_KEY]: true,
										[AUTH_PROVIDER_KEY]: 'fake_provider_key',
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
	});

	describe('when strict is set to store', function () {
		beforeEach(() => {
			const Class = getAzureStoreStrategy('test');
			azureStoreStrategy = new Class(
				container,
				{} as ConfigModule,
				{
					store: {
						identityMetadata: 'https://login.microsoftonline.com/common/.well-known/openid-configuration',
						clientID: 'fake',
						clientSecret: 'fake',
						successRedirect: '/admin/auth/azure',
						failureRedirect: 'http://localhost:9000/app/login',
						callbackUrl: 'http://localhost:9000/admin/auth/azure/cb',
						allowHttpForRedirectUrl: true,
					},
				} as AzureAuthOptions,
				'store'
			);
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		it('should succeed', async () => {
			profile = {
				upn: existsEmailWithMetaAndProviderKey,
			};

			const data = await azureStoreStrategy.validate(req, profile);
			expect(data).toEqual(
				expect.objectContaining({
					id: 'test3',
				})
			);
		});

		it('should fail when the customer exists without the metadata', async () => {
			profile = {
				upn: existsEmail,
			};

			const err = await azureStoreStrategy.validate(req, profile).catch((err) => err);
			expect(err).toEqual(new Error(`Customer with email ${existsEmail} already exists`));
		});

		it('should set AUTH_PROVIDER_KEY when CUSTOMER_METADATA_KEY exists but AUTH_PROVIDER_KEY does not', async () => {
			profile = {
				upn: existsEmailWithMeta,
			};

			const data = await azureStoreStrategy.validate(req, profile);
			expect(data).toEqual(
				expect.objectContaining({
					id: 'test2',
				})
			);
			expect(updateFn).toHaveBeenCalledTimes(1);
		});

		it('should fail when the metadata exists but auth provider key is wrong', async () => {
			profile = {
				upn: existsEmailWithMetaButWrongProviderKey,
			};

			const err = await azureStoreStrategy.validate(req, profile).catch((err) => err);
			expect(err).toEqual(
				new Error(`Customer with email ${existsEmailWithMetaButWrongProviderKey} already exists`)
			);
		});

		it('should succeed and create a new customer if it has not been found', async () => {
			profile = {
				upn: 'fake',
				name: {
					givenName: 'test',
					familyName: 'test',
				},
			};

			const data = await azureStoreStrategy.validate(req, profile);
			expect(data).toEqual(
				expect.objectContaining({
					id: 'test',
				})
			);
			expect(createFn).toHaveBeenCalledTimes(1);
		});
	});

	describe('when strict is set to admin', function () {
		beforeEach(() => {
			const Class = getAzureStoreStrategy('test');
			azureStoreStrategy = new Class(
				container,
				{} as ConfigModule,
				{
					store: {
						identityMetadata: 'https://login.microsoftonline.com/common/.well-known/openid-configuration',
						clientID: 'fake',
						clientSecret: 'fake',
						successRedirect: '/admin/auth/azure',
						failureRedirect: 'http://localhost:9000/app/login',
						callbackUrl: 'http://localhost:9000/admin/auth/azure/cb',
						allowHttpForRedirectUrl: true,
					},
				} as AzureAuthOptions,
				'admin'
			);
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		it('should succeed', async () => {
			profile = {
				upn: existsEmailWithMetaAndProviderKey,
			};

			const data = await azureStoreStrategy.validate(req, profile);
			expect(data).toEqual(
				expect.objectContaining({
					id: 'test3',
				})
			);
		});

		it('should succeed when the customer exists without the metadata', async () => {
			profile = {
				upn: existsEmail,
			};

			const data = await azureStoreStrategy.validate(req, profile);
			expect(data).toEqual(
				expect.objectContaining({
					id: 'test',
				})
			);
		});

		it('should set AUTH_PROVIDER_KEY when CUSTOMER_METADATA_KEY exists but AUTH_PROVIDER_KEY does not', async () => {
			profile = {
				upn: existsEmailWithMeta,
			};

			const data = await azureStoreStrategy.validate(req, profile);
			expect(data).toEqual(
				expect.objectContaining({
					id: 'test2',
				})
			);
			expect(updateFn).toHaveBeenCalledTimes(1);
		});

		it('should succeed when the metadata exists but auth provider key is wrong', async () => {
			profile = {
				upn: existsEmailWithMetaButWrongProviderKey,
			};

			const data = await azureStoreStrategy.validate(req, profile);
			expect(data).toEqual(
				expect.objectContaining({
					id: 'test4',
				})
			);
		});

		it('should succeed and create a new customer if it has not been found', async () => {
			profile = {
				upn: 'fake',
				name: {
					givenName: 'test',
					familyName: 'test',
				},
			};

			const data = await azureStoreStrategy.validate(req, profile);
			expect(data).toEqual(
				expect.objectContaining({
					id: 'test',
				})
			);
			expect(createFn).toHaveBeenCalledTimes(1);
		});
	});
});

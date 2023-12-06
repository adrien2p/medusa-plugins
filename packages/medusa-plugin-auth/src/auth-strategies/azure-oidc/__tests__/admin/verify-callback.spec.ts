import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AUTH_PROVIDER_KEY, IStrategy } from '../../../../types';
import { AZURE_ADMIN_STRATEGY_NAME, AzureAuthOptions } from '../../types';
import { getAzureAdminStrategy } from '../../admin';

describe('Azure AD admin strategy verify callback', function () {
	const existsEmail = 'exists@test.fr';
	const existsEmailWithProviderKey = 'exist3s@test.fr';
	const existsEmailWithWrongProviderKey = 'exist4s@test.fr';

	let container: MedusaContainer;
	let req: Request;
	let profile: { upn: string; name?: { givenName?: string; familyName?: string } };
	let azureAdminStrategy: IStrategy;

	beforeEach(() => {
		profile = {
			upn: existsEmail,
		};

		container = {
			resolve: (name: string) => {
				const container_ = {
					userService: {
						retrieveByEmail: jest.fn().mockImplementation(async (email: string) => {
							if (email === existsEmail) {
								return {
									id: 'test',
								};
							}

							if (email === existsEmailWithProviderKey) {
								return {
									id: 'test2',
									metadata: {
										[AUTH_PROVIDER_KEY]: AZURE_ADMIN_STRATEGY_NAME + '_test',
									},
								};
							}

							if (email === existsEmailWithWrongProviderKey) {
								return {
									id: 'test3',
									metadata: {
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

	describe('when strict is set to admin', function () {
		beforeEach(() => {
			const AzureAdminStrategy = getAzureAdminStrategy('test');
			azureAdminStrategy = new AzureAdminStrategy(
				container,
				{} as ConfigModule,
				{
					admin: {
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
				upn: existsEmailWithProviderKey,
			};

			const data = await azureAdminStrategy.validate(req, profile);
			expect(data).toEqual(
				expect.objectContaining({
					id: 'test2',
				})
			);
		});

		it('should fail when a user exists without the auth provider metadata', async () => {
			profile = {
				upn: existsEmail,
			};

			const err = await azureAdminStrategy.validate(req, profile).catch((err) => err);
			expect(err).toEqual(new Error(`Admin with email ${existsEmail} already exists`));
		});

		it('should fail when a user exists with the wrong auth provider key', async () => {
			profile = {
				upn: existsEmailWithWrongProviderKey,
			};

			const err = await azureAdminStrategy.validate(req, profile).catch((err) => err);
			expect(err).toEqual(new Error(`Admin with email ${existsEmailWithWrongProviderKey} already exists`));
		});

		it('should fail when the user does not exist', async () => {
			profile = {
				upn: 'fake',
			};

			const err = await azureAdminStrategy.validate(req, profile).catch((err) => err);
			expect(err).toEqual(new Error(`Unable to authenticate the user with the email fake`));
		});
	});

	describe('when strict is set to store', function () {
		beforeEach(() => {
			const AzureAdminStrategy = getAzureAdminStrategy('test');
			azureAdminStrategy = new AzureAdminStrategy(
				container,
				{} as ConfigModule,
				{
					admin: {
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
				upn: existsEmailWithProviderKey,
			};

			const data = await azureAdminStrategy.validate(req, profile);
			expect(data).toEqual(
				expect.objectContaining({
					id: 'test2',
				})
			);
		});

		it('should succeed when a user exists without the auth provider metadata', async () => {
			profile = {
				upn: existsEmail,
			};

			const data = await azureAdminStrategy.validate(req, profile);
			expect(data).toEqual(
				expect.objectContaining({
					id: 'test',
				})
			);
		});

		it('should succeed when a user exists with the wrong auth provider key', async () => {
			profile = {
				upn: existsEmailWithWrongProviderKey,
			};

			const data = await azureAdminStrategy.validate(req, profile);
			expect(data).toEqual(
				expect.objectContaining({
					id: 'test3',
				})
			);
		});

		it('should fail when the user does not exist', async () => {
			profile = {
				upn: 'fake',
			};

			const err = await azureAdminStrategy.validate(req, profile).catch((err) => err);
			expect(err).toEqual(new Error(`Unable to authenticate the user with the email fake`));
		});
	});
});

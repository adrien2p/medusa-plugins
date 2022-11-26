import { FacebookStoreStrategy } from '../../store';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AuthOptions, CUSTOMER_METADATA_KEY } from '../../../../types';
import { Profile } from '../../types';

describe('Facebook store strategy verify callback', function () {
	const existsEmail = 'exists@test.fr';
	const existsEmailWithMeta = 'exist2s@test.fr';

	let container: MedusaContainer;
	let req: Request;
	let accessToken: string;
	let refreshToken: string;
	let profile: Profile;
	let facebookStoreStrategy: FacebookStoreStrategy;

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

							return;
						}),
					},
				};

				return container_[name];
			},
		} as MedusaContainer;

		facebookStoreStrategy = new FacebookStoreStrategy(
			container,
			{} as ConfigModule,
			{ clientID: 'fake', clientSecret: 'fake', store: {} } as AuthOptions['facebook']
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should succeed', async () => {
		profile = {
			emails: [{ value: existsEmailWithMeta }],
		};

		const data = await facebookStoreStrategy.validate(req, accessToken, refreshToken, profile);
		expect(data).toEqual(
			expect.objectContaining({
				id: 'test2',
			})
		);
	});

	it('should fail when the customer exists without the metadata', async () => {
		profile = {
			emails: [{ value: existsEmail }],
		};

		const err = await facebookStoreStrategy.validate(req, accessToken, refreshToken, profile).catch((err) => err);
		expect(err).toEqual(new Error(`Customer with email ${existsEmail} already exists`));
	});

	it('should succeed and create a new customer if it has not been found', async () => {
		profile = {
			emails: [{ value: 'fake' }],
			name: {
				givenName: 'test',
				familyName: 'test',
			},
		};

		const data = await facebookStoreStrategy.validate(req, accessToken, refreshToken, profile);
		expect(data).toEqual(
			expect.objectContaining({
				id: 'test',
			})
		);
	});
});

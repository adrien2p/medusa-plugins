import { verifyStoreCallback } from '../../store';
import { MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { ENTITY_METADATA_KEY } from '../../index';

describe('Facebook store strategy verify callback', function () {
	const existsEmail = 'exists@test.fr';
	const existsEmailWithMeta = 'exist2s@test.fr';

	let container: MedusaContainer;
	let req: Request;
	let accessToken: string;
	let refreshToken: string;
	let profile: { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } };

	beforeEach(() => {
		profile = {
			emails: [{ value: existsEmail }],
		};

		container = {
			resolve: <T>(name: string): T => {
				const container_ = {
					manager: {
						transaction: function (cb) {
							cb();
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
										[ENTITY_METADATA_KEY]: true,
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

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should succeed', async () => {
		profile = {
			emails: [{ value: existsEmailWithMeta }],
		};

		const done = (err, data) => {
			expect(data).toEqual(
				expect.objectContaining({
					id: 'test2',
				})
			);
		};

		await verifyStoreCallback(container, req, accessToken, refreshToken, profile, done);
	});

	it('should fail when the customer exists without the metadata', async () => {
		profile = {
			emails: [{ value: existsEmail }],
		};

		const done = (err) => {
			expect(err).toEqual(new Error(`Customer with email ${existsEmail} already exists`));
		};

		await verifyStoreCallback(container, req, accessToken, refreshToken, profile, done);
	});

	it('should succeed and create a new customer if it has not been found', async () => {
		profile = {
			emails: [{ value: 'fake' }],
			name: {
				givenName: 'test',
				familyName: 'test',
			},
		};

		const done = (err, data) => {
			expect(data).toEqual(
				expect.objectContaining({
					id: 'test',
				})
			);
		};

		await verifyStoreCallback(container, req, accessToken, refreshToken, profile, done);
	});
});

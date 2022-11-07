import { verifyAdminCallback } from '../../admin';
import { MedusaContainer } from '@medusajs/medusa/dist/types/global';

describe('Google admin strategy verify callback', function () {
	const existsEmail = 'exists@test.fr';

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
			resolve: (name: string) => {
				const container_ = {
					userService: {
						retrieveByEmail: jest.fn().mockImplementation(async (email: string) => {
							if (email === existsEmail) {
								return {
									id: 'test',
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

	it('should success', async () => {
		profile = {
			emails: [{ value: existsEmail }],
		};

		const done = (err, data) => {
			expect(data).toEqual(
				expect.objectContaining({
					id: 'test',
				})
			);
		};

		await verifyAdminCallback(container, req, accessToken, refreshToken, profile, done);
	});

	it('should fail if the user does not exists', async () => {
		profile = {
			emails: [{ value: 'fake' }],
		};

		const done = (err) => {
			expect(err).toEqual(new Error(`Unable to authenticate the user with the email fake`));
		};

		await verifyAdminCallback(container, req, accessToken, refreshToken, profile, done);
	});
});

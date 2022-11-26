import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { FacebookAdminStrategy } from '../../admin';
import { AuthOptions } from '../../../../types';

describe('Facebook admin strategy verify callback', function () {
	const existsEmail = 'exists@test.fr';

	let container: MedusaContainer;
	let req: Request;
	let accessToken: string;
	let refreshToken: string;
	let profile: { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } };
	let facebookAdminStrategy: FacebookAdminStrategy;

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

		facebookAdminStrategy = new FacebookAdminStrategy(
			container,
			{} as ConfigModule,
			{ clientID: 'fake', clientSecret: 'fake', admin: {} } as AuthOptions['facebook']
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should success', async () => {
		profile = {
			emails: [{ value: existsEmail }],
		};

		const data = await facebookAdminStrategy.validate(req, accessToken, refreshToken, profile);
		expect(data).toEqual(
			expect.objectContaining({
				id: 'test',
			})
		);
	});

	it('should fail if the user does not exists', async () => {
		profile = {
			emails: [{ value: 'fake' }],
		};

		const err = await facebookAdminStrategy.validate(req, accessToken, refreshToken, profile).catch((err) => err);
		expect(err).toEqual(new Error(`Unable to authenticate the user with the email fake`));
	});
});

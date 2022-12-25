import { CustomerService, UserService } from '@medusajs/medusa';
import { MedusaError } from 'medusa-core-utils';
import { EntityManager } from 'typeorm';
import { ALLOWED_AUTH_PROVIDERS_KEY, CUSTOMER_METADATA_KEY } from '../types';

/**
 * Default validate callback used by an admin passport strategy
 *
 * @example
 * // "this" refers to the strategy extending the PassportStrategy mixin
 * await validateAdminCallback(this)(profile, { strategyErrorIdentifier: 'Google' });
 */
export function validateAdminCallback(this_: any) {
	/**
	 * @param profile
	 * @param strategyErrorIdentifier It will be used to compose the error message in case of an error (e.g Google, Facebook)
	 */
	return async <T extends { emails?: { value: string }[] } = { emails?: { value: string }[] }>(
		profile: T,
		{ strategyErrorIdentifier }: { strategyErrorIdentifier: string }
	): Promise<{ id: string } | never> => {
		const manager: EntityManager = this_.container.resolve('manager');
		const userService: UserService = this_.container.resolve('userService');

		const email = profile.emails?.[0]?.value;

		if (!email) {
			throw new MedusaError(
				MedusaError.Types.NOT_ALLOWED,
				`Your ${strategyErrorIdentifier} account does not contains any email and cannot be used`
			);
		}

		return await manager.transaction(async (transactionManager) => {
			const user = await userService
				.withTransaction(transactionManager)
				.retrieveByEmail(email)
				.catch(() => void 0);

			if (!user?.metadata?.[ALLOWED_AUTH_PROVIDERS_KEY]?.includes(this_.AUTH_PROVIDER_NAME)) {
				throw new MedusaError(
					MedusaError.Types.NOT_ALLOWED,
					`Unable to authenticate the admin with the email ${email}`
				);
			}

			return { id: user.id };
		});
	};
}

/**
 * Default validate callback used by a store passport strategy
 *
 * @example
 * // "this" refers to the strategy extending the PassportStrategy mixin
 * await validateStoreCallback(this)(profile, { strategyErrorIdentifier: 'Google' });
 */
export function validateStoreCallback(this_: any) {
	/**
	 * @param profile
	 * @param strategyErrorIdentifier It will be used to compose the error message in case of an error (e.g Google, Facebook)
	 */
	return async <
		T extends { name?: { givenName?: string; familyName?: string }; emails?: { value: string }[] } = {
			emails?: { value: string }[];
		}
	>(
		profile: T,
		{ strategyErrorIdentifier }: { strategyErrorIdentifier: string }
	): Promise<{ id: string } | never> => {
		const manager: EntityManager = this_.container.resolve('manager');
		const customerService: CustomerService = this_.container.resolve('customerService');

		const email = profile.emails?.[0]?.value;

		if (!email) {
			throw new MedusaError(
				MedusaError.Types.NOT_ALLOWED,
				`Your ${strategyErrorIdentifier} account does not contains any email and cannot be used`
			);
		}

		return await manager.transaction(async (transactionManager) => {
			const customer = await customerService
				.withTransaction(transactionManager)
				.retrieveRegisteredByEmail(email)
				.catch(() => void 0);

			if (customer) {
				if (customer.metadata?.[ALLOWED_AUTH_PROVIDERS_KEY]?.includes(this_.AUTH_PROVIDER_NAME)) {
					return { id: customer.id };
				}

				// TODO: Backward compatibility with update to the new checks. Will be removed in later version.
				if (customer.metadata?.[CUSTOMER_METADATA_KEY] && !customer.metadata?.[ALLOWED_AUTH_PROVIDERS_KEY]) {
					customer.metadata[ALLOWED_AUTH_PROVIDERS_KEY] = [this_.AUTH_PROVIDER_NAME];
					await customerService.withTransaction(transactionManager).update(customer.id, {
						metadata: customer.metadata,
					});
					return { id: customer.id };
				}

				throw new MedusaError(MedusaError.Types.INVALID_DATA, `Customer with email ${email} already exists`);
			}

			return await customerService
				.withTransaction(transactionManager)
				.create({
					email,
					metadata: {
						[ALLOWED_AUTH_PROVIDERS_KEY]: [this_.name],
					},
					first_name: profile.name?.givenName ?? '',
					last_name: profile.name?.familyName ?? '',
					has_account: true,
				})
				.then((customer) => {
					return { id: customer.id };
				});
		});
	};
}

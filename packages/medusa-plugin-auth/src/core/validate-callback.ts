import { CustomerService, UserService } from '@medusajs/medusa';
import { MedusaError } from 'medusa-core-utils';
import { EntityManager } from 'typeorm';
import { CUSTOMER_METADATA_KEY } from '../types';

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
		const userService: UserService = this_.container.resolve('userService');
		const email = profile.emails?.[0]?.value;

		if (!email) {
			throw new MedusaError(
				MedusaError.Types.NOT_ALLOWED,
				`Your ${strategyErrorIdentifier} account does not contains any email and cannot be used`
			);
		}

		const user = await userService.retrieveByEmail(email).catch(() => void 0);
		if (!user) {
			throw new MedusaError(
				MedusaError.Types.NOT_ALLOWED,
				`Unable to authenticate the user with the email ${email}`
			);
		}

		return { id: user.id };
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

		return await manager.transaction(async (transactionManager) => {
			const email = profile.emails?.[0]?.value;

			if (!email) {
				throw new MedusaError(
					MedusaError.Types.NOT_ALLOWED,
					`Your ${strategyErrorIdentifier} account does not contains any email and cannot be used`
				);
			}

			const customer = await customerService
				.withTransaction(transactionManager)
				.retrieveRegisteredByEmail(email)
				.catch(() => void 0);

			if (customer) {
				if (!customer.metadata || !customer.metadata[CUSTOMER_METADATA_KEY]) {
					throw new MedusaError(
						MedusaError.Types.INVALID_DATA,
						`Customer with email ${email} already exists`
					);
				} else {
					return { id: customer.id };
				}
			}

			return await customerService
				.withTransaction(transactionManager)
				.create({
					email,
					metadata: {
						[CUSTOMER_METADATA_KEY]: true,
					},
					first_name: profile.name?.givenName ?? '',
					last_name: profile.name?.familyName ?? '',
					has_account: true
				})
				.then((customer) => {
					return { id: customer.id };
				});
		});
	};
}

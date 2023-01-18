import { CustomerService, UserService } from '@medusajs/medusa';
import { MedusaError } from 'medusa-core-utils';
import { EntityManager } from 'typeorm';
import { CUSTOMER_METADATA_KEY, AUTH_PROVIDER_KEY } from '../types';
import { strategyNames, StrategyErrorIdentifierType } from '../types';
import { MedusaContainer } from '@medusajs/medusa/dist/types/global';

/**
 * Default validate callback used by an admin passport strategy
 *
 */
export async function validateAdminCallback<
	T extends { emails?: { value: string }[] } = {
		emails?: { value: string }[];
	}
>(
	profile: T,
	{
		container,
		strategyErrorIdentifier,
	}: { container: MedusaContainer; strategyErrorIdentifier: StrategyErrorIdentifierType }
): Promise<{ id: string } | never> {
	const userService: UserService = container.resolve('userService');
	const email = profile.emails?.[0]?.value;

	if (!email) {
		throw new MedusaError(
			MedusaError.Types.NOT_ALLOWED,
			`Your ${capitalize(strategyErrorIdentifier)} account does not contains any email and cannot be used`
		);
	}

	const user = await userService.retrieveByEmail(email).catch(() => void 0);

	if (user) {
		if (!user.metadata || user.metadata[AUTH_PROVIDER_KEY] !== strategyNames[strategyErrorIdentifier].admin) {
			throw new MedusaError(MedusaError.Types.INVALID_DATA, `Admin with email ${email} already exists`);
		}
	} else {
		throw new MedusaError(MedusaError.Types.NOT_ALLOWED, `Unable to authenticate the user with the email ${email}`);
	}

	return { id: user.id };
}

/**
 * Default validate callback used by a store passport strategy
 *
 * @param profile
 * @param strategyErrorIdentifier It will be used to compose the error message in case of an error (e.g Google, Facebook)
 * @param container
 */
export async function validateStoreCallback<
	T extends { name?: { givenName?: string; familyName?: string }; emails?: { value: string }[] } = {
		emails?: { value: string }[];
	}
>(
	profile: T,
	{
		container,
		strategyErrorIdentifier,
	}: { container: MedusaContainer; strategyErrorIdentifier: StrategyErrorIdentifierType }
): Promise<{ id: string } | never> {
	const manager: EntityManager = container.resolve('manager');
	const customerService: CustomerService = container.resolve('customerService');

	return await manager.transaction(async (transactionManager) => {
		const email = profile.emails?.[0]?.value;

		if (!email) {
			throw new MedusaError(
				MedusaError.Types.NOT_ALLOWED,
				`Your ${capitalize(strategyErrorIdentifier)} account does not contains any email and cannot be used`
			);
		}

		let customer = await customerService
			.withTransaction(transactionManager)
			.retrieveRegisteredByEmail(email)
			.catch(() => void 0);

		if (customer) {
			// To prevent Legacy applications from not authenticating because only CUSTOMER_METADATA_KEY was set
			if (
				customer.metadata &&
				customer.metadata[CUSTOMER_METADATA_KEY] &&
				!customer.metadata[AUTH_PROVIDER_KEY]
			) {
				customer.metadata[AUTH_PROVIDER_KEY] = strategyNames[strategyErrorIdentifier].store;
				await customerService.withTransaction(transactionManager).update(customer.id, {
					metadata: customer.metadata,
				});
			}

			if (
				!customer.metadata ||
				!customer.metadata[CUSTOMER_METADATA_KEY] ||
				customer.metadata[AUTH_PROVIDER_KEY] !== strategyNames[strategyErrorIdentifier].store
			) {
				throw new MedusaError(MedusaError.Types.INVALID_DATA, `Customer with email ${email} already exists`);
			} else {
				return { id: customer.id };
			}
		}

		customer = await customerService.withTransaction(transactionManager).create({
			email,
			metadata: {
				[CUSTOMER_METADATA_KEY]: true,
				[AUTH_PROVIDER_KEY]: strategyNames[strategyErrorIdentifier].store,
			},
			first_name: profile.name?.givenName ?? '',
			last_name: profile.name?.familyName ?? '',
			has_account: true,
		});

		return { id: customer.id };
	});
}

function capitalize(s: string) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

import qs from 'qs';
import {
	AdmincClient,
	defaultFilterValues,
	GetSentryTransactionEventsParams,
	GetSentryTransactionsParams
} from '../types';
import Admin from '@medusajs/medusa-js/dist/resources/admin';
import Medusa from '@medusajs/medusa-js';

export const parseQueryString = <T = unknown, S = unknown>(queryString?: string, filters: T | null = {} as T): S => {
	const defaultVal = {
		statsPeriod: defaultFilterValues.statsPeriod,
		perPage: defaultFilterValues.perPage,
		...filters,
	} as unknown as S;

	if (queryString) {
		const filters = qs.parse(queryString);
		for (const [key, value] of Object.entries(filters)) {
			defaultVal[key] = value;
		}
	}

	return defaultVal;
};

export const buildMedusaClient = ({
	baseUrl,
	organisation,
	project,
}): AdmincClient => {
	const medusa = new Medusa({ baseUrl, maxRetries: 1 });
	return {
		...medusa.admin,
		fetchSentryTransactions: async function (query?: GetSentryTransactionsParams) {
			let path = '/admin/sentry-transactions';

			query = {
				statsPeriod: defaultFilterValues.statsPeriod,
				...(query ?? {}),
				transaction: undefined,
				organisation,
				project,
			} as GetSentryTransactionsParams;

			if (query) {
				const queryString = qs.stringify(query);
				path += `?${queryString}`;
			}
			return await this.client.request('GET', path, undefined, {}, {});
		},
		fetchSentryTransactionEvents: async function (query?: GetSentryTransactionEventsParams) {
			let path = '/admin/sentry-transaction-events';

			if (!query?.transaction) {
				return Promise.resolve({ data: [] });
			}

			query = {
				statsPeriod: defaultFilterValues.statsPeriod,
				...(query ?? {}),
				organisation,
				project,
			} as GetSentryTransactionEventsParams;

			if (query) {
				const queryString = qs.stringify(query);
				path += `?${queryString}`;
			}
			return await this.client.request('GET', path, undefined, {}, {});
		},
	};
};

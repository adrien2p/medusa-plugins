import qs from 'qs';
import { defaultFilterValues, GetSentryTransactionEventsParams, GetSentryTransactionsParams } from '../types';
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
}): Admin & {
	fetchSentryTransactions: (query?: GetSentryTransactionsParams) => any;
	fetchSentryTransactionEvents: (query?: GetSentryTransactionEventsParams) => any;
} => {
	const medusa = new Medusa({ baseUrl, maxRetries: 1 });
	return {
		...medusa.admin,
		fetchSentryTransactions: async function (query?: GetSentryTransactionsParams) {
			let path = '/admin/sentry-transactions';

			query = {
				...(query ?? {}),
				transaction: undefined,
				statsPeriod: defaultFilterValues.statsPeriod,
				organisation,
				project,
			} as GetSentryTransactionsParams;

			if (query) {
				const queryString = qs.stringify(query);
				path += `?${queryString}`;
			}
			return await this.client.request('GET', path, undefined);
		},
		fetchSentryTransactionEvents: async function (query?: GetSentryTransactionEventsParams) {
			let path = '/admin/sentry-transaction-events';

			if (!query?.transaction) {
				return Promise.resolve({ data: [] });
			}

			query = {
				...(query ?? {}),
				statsPeriod: defaultFilterValues.statsPeriod,
				organisation,
				project,
			} as GetSentryTransactionEventsParams;

			if (query) {
				const queryString = qs.stringify(query);
				path += `?${queryString}`;
			}
			return await this.client.request('GET', path, undefined);
		},
	};
};

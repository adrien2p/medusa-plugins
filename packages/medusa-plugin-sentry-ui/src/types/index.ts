export const defaultFilterValues = {
	statsPeriod: '24h',
	perPage: 50,
	cursor: '0:0:0',
};

export type GetSentryTransactionsParams = {
	organisation: string;
	project: string;
	statsPeriod: string;
	perPage?: number;
	query?: string;
	cursor?: string;
};

export type GetSentryTransactionEventsParams = {
	transaction: string;
	organisation: string;
	project: string;
	statsPeriod: string;
	perPage?: number;
	query?: string;
	cursor?: string;
};

export type GetSentryTransactionsStatsParams = {
	organisation: string;
	project: string;
	statsPeriod: string;
	transaction?: string;
};

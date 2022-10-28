import Admin from '@medusajs/medusa-js/dist/resources/admin';

export const APDEX_HELP_TEXT =
	'Apdex is an industry-standard metric used to track and measure user satisfaction based on your application response times. A higher Apdex score is better than a lower one; the score can go up to 1.0, representing 100% of users having a satisfactory experience. The Apdex score provides the ratio of satisfactory, tolerable, and frustrated requests in a specific transaction or endpoint. This metric provides a standard for you to compare transaction performance, understand which ones may require additional optimization or investigation, and set targets or goals for performance';
export const P95_HELP_TEXT =
	'The P95 Threshold indicates that 5% of transaction durations are greater than the threshold';
export const P75_HELP_TEXT =
	'The P75 Threshold indicates that 25% of transaction durations are greater than the threshold';
export const P50_HELP_TEXT =
	'The P50 Threshold indicates that 50% of transaction durations are greater than the threshold';
export const TPM_HELP_TEXT =
	'Throughput indicates the number of transactions over a given time range (Total), average transactions per minute (TPM)';
export const FAILURE_RATE_HELP_TEXT =
	'indicates the percentage of unsuccessful transactions. Sentry treats transactions with a status other than “ok,” “cancelled,” and “unknown” as failures';

export const defaultFilterValues = {
	statsPeriod: '72h',
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

export type SentryFetchResult = {
	data: Record<string, string>[];
	meta: unknown;
	prev_cursor: string;
	next_cursor: string;
};

export type SentryStatsFetchResult = {
	[stat: string]: {
		data: [number, [{ count: number }]][];
	};
};

export type AdminClient = Admin & {
	fetchSentryTransactions: (query?: GetSentryTransactionsParams) => Promise<SentryFetchResult>;
	fetchSentryTransactionEvents: (query?: GetSentryTransactionEventsParams) => Promise<SentryFetchResult>;
	fetchSentryTransactionsStats: (query?: GetSentryTransactionsStatsParams) => Promise<SentryStatsFetchResult>;
};

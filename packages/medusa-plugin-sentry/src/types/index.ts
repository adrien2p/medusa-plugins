import { NodeOptions } from '@sentry/node/types/types';
import { Integration } from '@sentry/types/types/integration';
import { Router } from 'express';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { RequestHandlerOptions } from '@sentry/node/types/handlers';

export type SentryWebHookOptions = {
	path: string;
	secret: string;
	emitOnIssue?: boolean | ((container: unknown, data: SentryWebHookData) => Promise<void>);
	emitOnError?: boolean | ((container: unknown, data: SentryWebHookData) => Promise<void>);
	emitOnComment?: boolean | ((container: unknown, data: SentryWebHookData) => Promise<void>);
	emitOnEventOrMetricAlert?: boolean | ((container: unknown, data: SentryWebHookData) => Promise<void>);
	emitOnInstallOrDeleted?: boolean | ((container: unknown, data: SentryWebHookData) => Promise<void>);
};

export type SentryOptions = Omit<NodeOptions, 'integrations'> & {
	integrations: Integration[] | ((router: Router, sentry: typeof Sentry, tracing: typeof Tracing) => Integration[]);
	apiToken?: string;
	requestHandlerOptions?: RequestHandlerOptions;
	enableRequestHandler?: boolean;
	enableTracing?: boolean;
	webHookOptions?: SentryWebHookOptions;
};

export enum SentryWebHookEvent {
	SENTRY_RECEIVED_ISSUE = 'SentryReceivedIssue',
	SENTRY_RECEIVED_ERROR = 'SentryReceivedError',
	SENTRY_RECEIVED_COMMENT = 'SentryReceivedComment',
	SENTRY_RECEIVED_EVENT_OR_METRIC_ALERT = 'SentryReceivedEventOrMetricAlert',
	SENTRY_RECEIVED_INSTALL_OR_DELETED = 'SentryReceivedInstallOrDeleted',
}

export type SentryWebHookData = {
	actor: unknown;
	action: unknown;
	data: unknown;
	installation: unknown;
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

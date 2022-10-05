import { NodeOptions } from '@sentry/node/types/types';
import { Integration } from '@sentry/types/types/integration';
import { Router } from 'express';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { RequestHandlerOptions } from '@sentry/node/types/handlers';

export type SentryWebHookOptions = {
	path: string;
	secret: string;
	emitOnIssue?: boolean | ((req) => Promise<void>);
	emitOnError?: boolean | ((req) => Promise<void>);
	emitOnComment?: boolean | ((req) => Promise<void>);
	emitOnEventOrMetricAlert?: boolean | ((req) => Promise<void>);
	emitOnInstallOrDeleted?: boolean | ((req) => Promise<void>);
};

export type SentryOptions = Omit<NodeOptions, 'integrations'> & {
	integrations: Integration[] | ((router: Router, sentry: typeof Sentry, tracing: typeof Tracing) => Integration[]);
	apiToken?: string;
	shouldHandleError: (code: number) => boolean;
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

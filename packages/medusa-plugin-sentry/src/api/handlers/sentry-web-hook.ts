import { Request, Response } from 'express';
import SentryService from '../../services/sentry';
import { verifySignature } from '../../utils';
import { SentryWebHookOptions } from '../../types';

export default (webHookOptions: SentryWebHookOptions) => {
	return async (req: Request, res: Response) => {
		if (!verifySignature(req, webHookOptions.secret)) {
			return res.sendStatus(401);
		}

		res.status(200);

		// Parse the JSON body fields off of the request
		const { action, data, installation, actor } = req.body;
		const { uuid } = installation || {};

		// Identify the resource triggering the webhook in Sentry
		const resource = req.header('sentry-hook-resource');
		if (!action || !data || !uuid || !resource) {
			return res.sendStatus(400);
		}

		const sentryService: SentryService = req.scope.resolve(SentryService.RESOLVE_KEY);

		const dataToEmit = {
			actor,
			action,
			data,
			installation,
		};

		// Handle webhooks related to issues
		if (webHookOptions.emitOnIssue && resource === 'issue') {
			await sentryService.handleIssues(dataToEmit);
			res.status(200);
		}

		// Handle webhooks related to errors
		if (webHookOptions.emitOnError && resource === 'error') {
			await sentryService.handleErrors(dataToEmit);
			res.status(200);
		}

		// Handle webhooks related to comments
		if (webHookOptions.emitOnComment && resource === 'comment') {
			await sentryService.handleComments(dataToEmit);

			res.status(200);
		}

		// Handle webhooks related to alerts
		if (webHookOptions.emitOnEventOrMetricAlert && (resource === 'event_alert' || resource === 'metric_alert')) {
			await sentryService.handleAlerts(dataToEmit);
			res.status(200);
		}

		// Handle uninstallation webhook
		if (webHookOptions.emitOnInstallOrDeleted && resource === 'installation' && action === 'deleted') {
			await sentryService.handleInstallation(dataToEmit);
			res.status(200);
		}

		res.send();
	};
};

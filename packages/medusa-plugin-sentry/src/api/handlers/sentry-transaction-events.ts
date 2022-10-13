import { Request, Response } from 'express';
import { validator } from '@medusajs/medusa/dist/utils/validator';
import SentryService from '../../services/sentry';
import { IsOptional, IsString } from 'class-validator';
import { GetSentryTransactionsParams } from './sentry-transaction';

export default (token: string) => {
	return async (req: Request, res: Response) => {
		const { transaction, organisation, project, statsPeriod, perPage, cursor, query } = await validator(
			GetSentryTransactionEventsParams,
			req.query
		);

		const sentryService: SentryService = req.scope.resolve(SentryService.RESOLVE_KEY);
		const result = await sentryService.fetchTransactionEvents({
			transaction,
			organisation,
			project,
			query,
			statsPeriod,
			perPage,
			cursor,
			token,
		});
		res.json(result);
	};
};

export class GetSentryTransactionEventsParams extends GetSentryTransactionsParams {
	@IsString()
	transaction: string;

	@IsOptional()
	@IsString()
	query?: string;
}

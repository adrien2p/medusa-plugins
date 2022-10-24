import { Request, Response } from 'express';
import { validator } from '@medusajs/medusa/dist/utils/validator';
import SentryService from '../../services/sentry';
import { IsOptional, IsString } from 'class-validator';

export default (token: string) => {
	return async (req: Request, res: Response) => {
		const { transaction, organisation, project, statsPeriod } = await validator(
			GetSentryTransactionsStatsParams,
			req.query
		);

		const sentryService: SentryService = req.scope.resolve(SentryService.RESOLVE_KEY);
		const result = await sentryService.fetchTransactionsStats({
			transaction,
			organisation,
			project,
			statsPeriod,
			token,
		});
		res.json(result);
	};
};

export class GetSentryTransactionsStatsParams {
	@IsString()
	organisation: string;

	@IsString()
	project: string;

	@IsString()
	statsPeriod: string;

	@IsString()
	@IsOptional()
	transaction?: string;
}

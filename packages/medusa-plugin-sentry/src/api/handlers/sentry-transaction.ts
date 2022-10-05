import { Request, Response } from 'express';
import { validator } from '@medusajs/medusa/dist/utils/validator';
import SentryService from '../../services/sentry';
import { IsOptional, IsString } from 'class-validator';

export default (token: string) => {
	return async (req: Request, res: Response) => {
		const { organisation, project, statsPeriod, perPage, cursor } = await validator(
			GetSentryTransactionsParams,
			req.query
		);

		const sentryService: SentryService = req.scope.resolve(SentryService.RESOLVE_KEY);
		const result = await sentryService.fetchSentryTransactions({
			organisation,
			project,
			statsPeriod,
			perPage,
			cursor,
			token,
		});
		res.json(result);
	};
};

export class GetSentryTransactionsParams {
	@IsString()
	organisation: string;

	@IsString()
	project: string;

	@IsString()
	statsPeriod: string;

	@IsOptional()
	@IsString()
	perPage?: string;

	@IsOptional()
	@IsString()
	cursor?: string;
}

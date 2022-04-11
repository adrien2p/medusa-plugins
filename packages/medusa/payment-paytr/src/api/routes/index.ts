import { Response, Router } from 'express';
import * as bodyParser from 'body-parser';

import middlewares from '../middleware';
import { CustomRequest } from '../../types';
import PayTRProviderService from '../../services/paytr-provider';

const route = Router();

export default (app: Router): Router => {
	app.use('/pay-tr', route);

	route.post('/callback', bodyParser.json(), bodyParser.urlencoded({ extended: true }), middlewares.wrap(webhook));

	return app;
};

async function webhook(req: CustomRequest, res: Response): Promise<void> {
	const data = req.body;

	const payTRProviderService = req.scope.resolve('pp_paytr') as PayTRProviderService;
	await payTRProviderService.handleCallback(data);
	res.send('OK');
}

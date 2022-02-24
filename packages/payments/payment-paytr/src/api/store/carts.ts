import { Response, Router } from 'express';
import PayTRProviderService from '../../services/paytr-provider';
import * as bodyParser from 'body-parser';
import middlewares from '../middleware';
import { CustomRequest } from '../../types';

const router = Router();

export default () => {
	router.post('/:cart_id/generate-iframe-url', bodyParser.json(), middlewares.wrap(generateToken));
	return router;
};

async function generateToken(req: CustomRequest, res: Response): Promise<void> {
	const { cart_id } = req.params;

	const payTrProvider = req.scope.resolve<PayTRProviderService>('pp_paytr');

	await payTrProvider
		.generateToken(cart_id)
		.then((token: string) => {
			return res.json({ url: 'https://www.paytr.com/odeme/guvenli/' + token });
		})
		.catch((err) => {
			return res.status(400).send({ errorMessage: err.message });
		});
}

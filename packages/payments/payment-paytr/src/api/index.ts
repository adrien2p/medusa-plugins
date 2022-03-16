import { Router } from 'express';
import routes from './routes';

export default (): Router => {
	const app = Router();

	routes(app);

	return app;
};

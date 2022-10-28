import { RequestHandler, Router } from 'express';
import * as swStats from 'swagger-stats';
import { SwaggerStats } from '../types';

export default function (rootDirectory, pluginOptions: SwaggerStats): RequestHandler[] {
	const router = Router();

	const { name = 'Medusa monitoring Dashboard', ...promOptions } = pluginOptions;
	const options = { name, ...promOptions };

	const globalMiddlewares = [swStats.getMiddleware(options)];
	if (options.swaggerSpec && typeof options.swaggerSpec === 'string') {
		const SwaggerParser = require('swagger-parser');
		const parser = new SwaggerParser();
		globalMiddlewares.push(
			parser.validate(options.swaggerSpec, (err, api) => {
				const swaggerSpec = api;
				router.use(swStats.getMiddleware({ ...options, swaggerSpec }));
			})
		);
	}

	return globalMiddlewares;
}

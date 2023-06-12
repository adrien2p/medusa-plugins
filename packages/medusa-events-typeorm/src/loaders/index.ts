import glob from 'glob';
import { Logger, MedusaContainer } from '@medusajs/medusa/dist/types/global';

export default async function authStrategiesLoader(container: MedusaContainer) {
	const logger = container.resolve<Logger>('logger');
	try {
		const files = glob.sync('../event-subscribers/[!__]*.js', {});

		await Promise.all(
			files.map(async (loader) => {
				const subscriber = require(loader).default;
				subscriber.attach();
			})
		);
		logger.info('Events Subscriber loaded successfully');
	} catch (err) {
		logger.warn(`Events Subscriber failed: ${err.message}`);
		return Promise.resolve();
	}
}

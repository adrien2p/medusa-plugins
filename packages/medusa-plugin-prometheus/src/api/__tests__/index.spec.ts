import express from 'express';
import request from 'supertest';
import router from '../index';

describe('Prometheus API', () => {
	let app;
	let appRequest;

	beforeAll(() => {
		app = express();
		app.use(
			'/',
			router('', {
				uriPath: '/monitoring',
			})
		);
		appRequest = request(app);
	});

	it('should display find the monitoring dashboard', async () => {
		return await appRequest.get('/monitoring').expect(302);
	});

	it('should display find the monitoring data', async () => {
		return await appRequest.get('/monitoring/stats').expect(200);
	});
});

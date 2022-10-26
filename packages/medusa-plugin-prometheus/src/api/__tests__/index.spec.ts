import express, { Express } from 'express';
const request = require('supertest');
import router from '../index';

describe('Prometheus API', () => {
	let app: Express;
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
		return appRequest
			.get('/monitoring')
			.expect(302)
	});

  it('should display find the monitoring data', async () => {
		return appRequest
			.get('/monitoring/stats')
			.expect(200)
	});
});

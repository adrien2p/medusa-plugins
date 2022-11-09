import axios from 'axios';
import { MockManager } from 'medusa-test-utils';
import SentryService from '../sentry';
import { EventBusService } from '@medusajs/medusa';
import { SentryWebHookEvent } from '../../types';

describe('sentry service', () => {
	let axiosGetSpy;
	let sentryService: SentryService;

	const eventBusServiceMock = {
		withTransaction: function () {
			return this;
		},
		emit: jest.fn().mockImplementation(() => Promise.resolve()),
	} as unknown as EventBusService;

	const config = {
		apiToken: 'fake_api_token',
		dsn: 'fake_dsn',
		integrations: (router, Sentry, Tracing) => {
			return [new Sentry.Integrations.Http({ tracing: true }), new Tracing.Integrations.Express({ router })];
		},
		tracesSampleRate: 1.0,
		webHookOptions: {
			path: '/sentry',
			secret: 'fake_secret',
			emitOnError: true,
		},
	};

	beforeAll(() => {
		axiosGetSpy = jest.spyOn(axios, 'get').mockImplementation(() => {
			return Promise.resolve({
				data: { data: [], meta: {} },
				headers: { link: 'results="true";cursor="0:100:0"' },
			});
		});

		sentryService = new SentryService(
			{
				manager: MockManager,
				eventBusService: eventBusServiceMock,
			},
			config
		);
	});

	afterAll(() => {
		axiosGetSpy.mockRestore();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should fetchSentryTransactions', async () => {
		const res = await sentryService.fetchTransactions({
			organisation: 'org',
			project: 'pro',
			statsPeriod: '24h',
			perPage: 100,
			token: config.apiToken,
			cursor: '',
		});

		expect(axiosGetSpy).toHaveBeenCalledTimes(1);
		expect(axiosGetSpy).toHaveBeenCalledWith('https://sentry.io/api/0/organizations/org/events/', {
			headers: {
				Authorization: `Bearer ${config.apiToken}`,
			},
			params: expect.any(Object),
		});

		expect(res).toEqual({
			data: [],
			meta: {},
			next_cursor: '0:100:0',
			prev_cursor: undefined,
		});
	});

	it('should fetchTransactionEvents', async () => {
		const res = await sentryService.fetchTransactionEvents({
			transaction: 'fake_trans',
			organisation: 'org',
			project: 'pro',
			statsPeriod: '24h',
			perPage: 100,
			token: config.apiToken,
			cursor: '',
		});

		expect(axiosGetSpy).toHaveBeenCalledTimes(1);
		expect(axiosGetSpy).toHaveBeenCalledWith('https://sentry.io/api/0/organizations/org/events/', {
			headers: {
				Authorization: `Bearer ${config.apiToken}`,
			},
			params: expect.any(Object),
		});

		expect(res).toEqual({
			data: [],
			meta: {},
			next_cursor: '0:100:0',
			prev_cursor: undefined,
		});
	});

	describe('when handleIssues is called', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it('should emit an event', async () => {
			const data = {
				actor: {},
				action: {},
				data: {},
				installation: {},
			};

			await sentryService.handleIssues(data);

			expect(eventBusServiceMock.emit).toHaveBeenCalledTimes(1);
			expect(eventBusServiceMock.emit).toHaveBeenCalledWith(SentryWebHookEvent.SENTRY_RECEIVED_ISSUE, data);
		});

		it('should call the given handler', async () => {
			const mockedConfig = {
				...config,
				webHookOptions: {
					...config.webHookOptions,
					emitOnIssue: jest.fn(),
				},
			};
			sentryService = new SentryService(
				{
					manager: MockManager,
					eventBusService: eventBusServiceMock,
				},
				mockedConfig
			);

			const data = {
				actor: {},
				action: {},
				data: {},
				installation: {},
			};

			await sentryService.handleIssues(data);

			expect(eventBusServiceMock.emit).toHaveBeenCalledTimes(0);
			expect(mockedConfig.webHookOptions.emitOnIssue).toHaveBeenCalledTimes(1);
			expect(mockedConfig.webHookOptions.emitOnIssue).toHaveBeenCalledWith(expect.any(Object), data);
		});
	});

	describe('when handleErrors is called', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it('should emit an event', async () => {
			const data = {
				actor: {},
				action: {},
				data: {},
				installation: {},
			};

			await sentryService.handleErrors(data);

			expect(eventBusServiceMock.emit).toHaveBeenCalledTimes(1);
			expect(eventBusServiceMock.emit).toHaveBeenCalledWith(SentryWebHookEvent.SENTRY_RECEIVED_ERROR, data);
		});

		it('should call the given handler', async () => {
			const mockedConfig = {
				...config,
				webHookOptions: {
					...config.webHookOptions,
					emitOnError: jest.fn(),
				},
			};
			sentryService = new SentryService(
				{
					manager: MockManager,
					eventBusService: eventBusServiceMock,
				},
				mockedConfig
			);

			const data = {
				actor: {},
				action: {},
				data: {},
				installation: {},
			};

			await sentryService.handleErrors(data);

			expect(eventBusServiceMock.emit).toHaveBeenCalledTimes(0);
			expect(mockedConfig.webHookOptions.emitOnError).toHaveBeenCalledTimes(1);
			expect(mockedConfig.webHookOptions.emitOnError).toHaveBeenCalledWith(expect.any(Object), data);
		});
	});

	describe('when handleComments is called', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it('should emit an event', async () => {
			const data = {
				actor: {},
				action: {},
				data: {},
				installation: {},
			};

			await sentryService.handleComments(data);

			expect(eventBusServiceMock.emit).toHaveBeenCalledTimes(1);
			expect(eventBusServiceMock.emit).toHaveBeenCalledWith(SentryWebHookEvent.SENTRY_RECEIVED_COMMENT, data);
		});

		it('should call the given handler', async () => {
			const mockedConfig = {
				...config,
				webHookOptions: {
					...config.webHookOptions,
					emitOnComment: jest.fn(),
				},
			};
			sentryService = new SentryService(
				{
					manager: MockManager,
					eventBusService: eventBusServiceMock,
				},
				mockedConfig
			);

			const data = {
				actor: {},
				action: {},
				data: {},
				installation: {},
			};

			await sentryService.handleComments(data);

			expect(eventBusServiceMock.emit).toHaveBeenCalledTimes(0);
			expect(mockedConfig.webHookOptions.emitOnComment).toHaveBeenCalledTimes(1);
			expect(mockedConfig.webHookOptions.emitOnComment).toHaveBeenCalledWith(expect.any(Object), data);
		});
	});

	describe('when handleAlerts is called', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it('should emit an event', async () => {
			const data = {
				actor: {},
				action: {},
				data: {},
				installation: {},
			};

			await sentryService.handleAlerts(data);

			expect(eventBusServiceMock.emit).toHaveBeenCalledTimes(1);
			expect(eventBusServiceMock.emit).toHaveBeenCalledWith(
				SentryWebHookEvent.SENTRY_RECEIVED_EVENT_OR_METRIC_ALERT,
				data
			);
		});

		it('should call the given handler', async () => {
			const mockedConfig = {
				...config,
				webHookOptions: {
					...config.webHookOptions,
					emitOnEventOrMetricAlert: jest.fn(),
				},
			};
			sentryService = new SentryService(
				{
					manager: MockManager,
					eventBusService: eventBusServiceMock,
				},
				mockedConfig
			);

			const data = {
				actor: {},
				action: {},
				data: {},
				installation: {},
			};

			await sentryService.handleAlerts(data);

			expect(eventBusServiceMock.emit).toHaveBeenCalledTimes(0);
			expect(mockedConfig.webHookOptions.emitOnEventOrMetricAlert).toHaveBeenCalledTimes(1);
			expect(mockedConfig.webHookOptions.emitOnEventOrMetricAlert).toHaveBeenCalledWith(expect.any(Object), data);
		});
	});

	describe('when handleInstallation is called', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it('should emit an event', async () => {
			const data = {
				actor: {},
				action: {},
				data: {},
				installation: {},
			};

			await sentryService.handleInstallation(data);

			expect(eventBusServiceMock.emit).toHaveBeenCalledTimes(1);
			expect(eventBusServiceMock.emit).toHaveBeenCalledWith(
				SentryWebHookEvent.SENTRY_RECEIVED_INSTALL_OR_DELETED,
				data
			);
		});

		it('should call the given handler', async () => {
			const mockedConfig = {
				...config,
				webHookOptions: {
					...config.webHookOptions,
					emitOnInstallOrDeleted: jest.fn(),
				},
			};
			sentryService = new SentryService(
				{
					manager: MockManager,
					eventBusService: eventBusServiceMock,
				},
				mockedConfig
			);

			const data = {
				actor: {},
				action: {},
				data: {},
				installation: {},
			};

			await sentryService.handleInstallation(data);

			expect(eventBusServiceMock.emit).toHaveBeenCalledTimes(0);
			expect(mockedConfig.webHookOptions.emitOnInstallOrDeleted).toHaveBeenCalledTimes(1);
			expect(mockedConfig.webHookOptions.emitOnInstallOrDeleted).toHaveBeenCalledWith(expect.any(Object), data);
		});
	});
});

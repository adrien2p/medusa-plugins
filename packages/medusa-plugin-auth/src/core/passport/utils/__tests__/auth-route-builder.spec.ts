import { extractDomain } from '../auth-routes-builder';

describe('auth route builder', () => {
	it('should be able to extract a domain from an url', () => {
		let url = 'https://www.google.com';
		let domain = extractDomain(url);
		expect(domain).toBe('google.com');

		url = 'http://www.google.com';
		domain = extractDomain(url);
		expect(domain).toBe('google.com');

		url = 'http://google.com';
		domain = extractDomain(url);
		expect(domain).toBe('google.com');
	});
});

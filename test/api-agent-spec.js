require('../');
const axios = require('axios');
const assert = require('assert');
const cache = require('../src/cache');

describe('API-agent', function () {
	const cookieStringReg = /LC_AGENT=([a-z0-9]{40})/;
	const agentAxios = axios.create({
		baseURL: `${config.serverName}/api`,
	});

	describe('GET /agent/fetch', function () {
		let agentId = null;

		it('should be a html text with cookie', async function () {
			const response = await agentAxios.get('/agent/fetch');
			const { headers } = response;
			
			assert.equal(headers['content-type'], 'text/html; charset=utf-8');
			assert(cookieStringReg.test(headers['set-cookie'][0]));

			agentId = headers['set-cookie'][0].match(cookieStringReg)[1];
		});

		it('should respond the same agentId in 10 secs', function (done) {
			setTimeout(async () => {
				const response = await agentAxios.get('/agent/fetch', {
					headers: { cookie: `LC_AGENT=${agentId}` }
				});
	
				const { headers } = response;
				assert.equal(headers['set-cookie'], undefined);

				done();
			}, 6000);
		});

		it('should respond the same agentId in 10 secs again', function (done) {
			setTimeout(async () => {
				const response = await agentAxios.get('/agent/fetch', {
					headers: { cookie: `LC_AGENT=${agentId}` }
				});
	
				const { headers } = response;
				assert.equal(headers['set-cookie'], undefined);

				done();
			}, 6000);
		});

		it('should respond a new agentId over 10 secs', function (done) {
			setTimeout(async () => {
				const response = await agentAxios.get('/agent/fetch', {
					headers: { cookie: `LC_AGENT=${agentId}` }
				});

				const { headers } = response;
				assert(cookieStringReg.test(headers['set-cookie'][0]));

				done();
			}, 12000);
		});

	});

	describe('POST /agent/:agentId/window', function () {
		it('should create a new window');
		it('should create another window behind last one in agent.window.list');
	});

	describe('GET /agent/:agentId/window/:windowId', function () {
		it('should be 200 & respond a window entry');
		it('should be found the window entry in 10 secs');
		it('should be auto-removed after another 10 secs');
	});

	describe('DELETE /agent/:agentId/window/:windowId', function () {
		it('should respond the removed window & not found when get again');
		it('should [B, C] in agent.window.list "+A +B -A +C +D -D"');
	});

});
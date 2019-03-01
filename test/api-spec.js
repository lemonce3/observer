const axios = require('axios');
const path = require('path');
const assert = require('assert');
const $store = require('../src/model/base/store');
const { Agent, Master, Window, Program } = require('../src/model');

const config = require(path.resolve('config.json'));

require('../');

describe.only('Api::', function () {
	const httpAgent = axios.create({
		baseURL: config.serverName
	});
	
	this.afterEach(function () {
		$store.master = {};
		$store.agent = {};
		$store.program = {};
		$store.window = {};
	});

	describe('GET /api/agent.html', function () {
		const cookieStringReg = /LC_AGENT=(\d+)/;

		it('should be a html with set-cookie.', async () => {
			const response = await httpAgent.get('/api/agent.html');
			const { headers } = response;

			assert.equal(headers['content-type'], 'text/html; charset=utf-8');
			assert(cookieStringReg.test(headers['set-cookie'][0]));
		});

		it('should not re-new a agent if there is an agent id in cookie.', async () => {
			const resA = await httpAgent.get('/api/agent.html');
			const agentId = resA.headers['set-cookie'][0].match(cookieStringReg)[1];

			await new Promise(resolve => setTimeout(resolve, 100));

			const resB = await httpAgent.get('/api/agent.html', {
				headers: {
					'Cookie': `LC_AGENT=${agentId}`
				}
			});
			
			assert.strictEqual(resB.headers['set-cookie'], undefined);
		});
	});

	describe('GET /api/agent', function () {
		it('should be no agent there.', async () => {
			const { data } = await httpAgent.get('/api/agent');

			assert.deepStrictEqual(data, []);
		});

		it('should be 3 agents there.', async () => {
			Agent.create('ie');
			Agent.create('chrome');
			Agent.create('firefox');

			const { data } = await httpAgent.get('/api/agent');

			assert.deepStrictEqual(data.length, 3);
		});
	});

	describe('POST /api/master', function () {
		it('should be created without binding agent.');
		it('should be created with binding agent.');
		it('should not be created if agents are busy.');
	});

	describe('PUT /api/master/:masterId', function () {
		it('read program');
		it('call program');
		it('update a agent');
		it('resolve a dialog');
	});

	describe('DELETE /api/master/:masterId', function () {
		it('should delete a existed master.');
		it('can not delete no such master.');
	});

	describe('POST /api/window', function () {
		it('should a new agent be created.');
	});

	describe('PUT /api/window/:windowId', function () {
		it('should be updated.');
		it('exit a program');

	});

	describe('DELETE /api/window/:windowId', function () {
		it('should be removed');
		it('should be removed');
	});

	describe('POST /api/window/:windowId/dialog', function () {
		it('alert timeout');
		it('should confirm be resolved');
		it('should prompt be resolved');
		it('should alert be resolved');
	});

});
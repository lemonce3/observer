const axios = require('axios');
const path = require('path');
const assert = require('assert');
const $store = require('../src/model/base/store');
const _ = require('lodash');
const { Agent, Window } = require('../src/model');

const config = require(path.resolve('config.json'));

require('../');

describe('Api::', function () {
	const httpAgent = axios.create({ baseURL: config.serverName });
	
	this.afterEach(function () {
		$store.master = {};
		$store.agent = {};
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
		it('should be created without binding agent.', async () => {
			const response = await httpAgent.post('/api/master', {
				agents: []
			});

			assert.deepStrictEqual(response.data.agents, {});

			assert(_.isNumber(response.data.id));
			assert.notStrictEqual($store.master[response.data.id], undefined);
		});

		it('should be created with binding agent.', async () => {
			const agentA = Agent.create();
			const agentB = Agent.create();
			const agentC = Agent.create();

			const response = await httpAgent.post('/api/master', {
				agents: [agentA.data.id, agentC.data.id]
			});

			const masterId = response.data.id;

			assert.notStrictEqual(response.data.agents[agentA.data.id], undefined);
			assert.notStrictEqual(response.data.agents[agentC.data.id], undefined);
			assert.equal(Object.keys(response.data.agents).length, 2);

			assert.equal(agentA.data.masterId, masterId);
			assert.equal(agentC.data.masterId, masterId);
			assert.equal(agentB.data.masterId, null);
		});

		it('should not be created if agents are busy.', async () => {
			const agentA = Agent.create();
			const agentB = Agent.create();
			
			await httpAgent.post('/api/master', {
				agents: [agentB.data.id]
			});

			try {
				await httpAgent.post('/api/master', {
					agents: [agentA.data.id, agentB.data.id]
				});
			} catch (error) {
				assert.equal(error.response.status, 409);
			}
		});

		it('should not be created if any agent is NOT found.', async () => {			
			try {
				await httpAgent.post('/api/master', {
					agents: [123]
				});
			} catch (error) {
				assert.equal(error.response.status, 404);
			}
		});
	});

	describe('PUT /api/master/:masterId', function () {
		it('update a agent', async function () {
			const agent = Agent.create();
			const window = Window.create(agent.data.id);

			const { data: masterData } = await httpAgent.post('/api/master', {
				agents: [agent.data.id]
			});

			Object.values(masterData.agents).forEach(agentData => {
				agentData.modifier = { ctrl: true, shift: true, alt: true, meta: true };
				agentData.pointer = { x: 2, y: 2 };
			});

			const response = await httpAgent.put(`/api/master/${masterData.id}`, masterData);

			assert.deepEqual(response.data, {
				id: masterData.id,
				agents: {
					[agent.data.id]: {
						ua: null,
						id: agent.data.id,
						modifier: { ctrl: true, shift: true, alt: true, meta: true },
						pointer: { x: 2, y: 2 },
						windows: [
							{
								id: window.data.id,
								meta: { title: null, URL: null, referrer: null, domain: null },
								rect: { width: 0, height: 0, top: 0, left: 0 },
								dialog: { alert: null, confirm: null, prompt: null },
								program: {
									hash: null,
									name: null,
									args: [],
									error: null,
									// returnValue: undefined,
									isExited: true
								}
							}
						]
					}
				} 
			});
		});

		it('call program', async function () {
			const agent = Agent.create();
			const window = Window.create(agent.data.id);
			const { data: masterData } = await httpAgent.post('/api/master', {
				agents: [agent.data.id]
			});

			Object.assign(masterData.agents[agent.data.id].windows[0].program, {
				hash: '1234abcd',
				name: 'program.test',
				args: []
			});

			const response = await httpAgent.put(`/api/master/${masterData.id}`, masterData);

			assert.deepEqual(response.data, {
				id: masterData.id,
				agents: {
					[agent.data.id]: {
						id: agent.data.id,
						ua: null,
						modifier: { ctrl: false, shift: false, alt: false, meta: false },
						pointer: { x: 0, y: 0 },
						windows: [
							{
								id: window.data.id,
								meta: { title: null, URL: null, referrer: null, domain: null },
								rect: { width: 0, height: 0, top: 0, left: 0 },
								dialog: { alert: null, confirm: null, prompt: null },
								program: {
									hash: '1234abcd',
									name: 'program.test',
									args: [],
									error: null,
									// returnValue: undefined,
									isExited: false
								}
							}
						]
					}
				}
			});
		});

		it('resolve a dialog', async function () {
			const agent = Agent.create();
			const window = Window.create(agent.data.id);

			window.openDialog('prompt', 'Please type your name:', '1234abcd');

			const { data: masterData } = await httpAgent.post('/api/master', {
				agents: [agent.data.id]
			});
			
			assert.deepEqual(masterData, {
				id: masterData.id,
				agents: {
					[agent.data.id]: {
						id: agent.data.id,
						ua: null,
						modifier: { ctrl: false, shift: false, alt: false, meta: false },
						pointer: { x: 0, y: 0 },
						windows: [
							{
								id: window.data.id,
								meta: { title: null, URL: null, referrer: null, domain: null },
								rect: { width: 0, height: 0, top: 0, left: 0 },
								dialog: {
									alert: null,
									confirm: null,
									prompt: {
										message: 'Please type your name:',
										ticket: '1234abcd'
									}
								},
								program: {
									hash: null,
									name: null,
									args: [],
									error: null,
									// returnValue: undefined,
									isExited: true
								}
							}
						]
					}
				}
			});

			masterData.agents[agent.data.id].windows[0].dialog.prompt.value = 'foo';

			const response = await httpAgent.put(`/api/master/${masterData.id}`, masterData);

			assert.deepEqual(response.data.agents[agent.data.id].windows[0].dialog, {
				alert: null,
				confirm: null,
				prompt: null
			});
		});
	});

	describe('DELETE /api/master/:masterId', function () {
		it('should delete a existed master.', async function () {
			const { data: masterModel } = await httpAgent.post('/api/master', { agents: [] });

			const response = await httpAgent.delete(`/api/master/${masterModel.id}`);

			assert.deepStrictEqual(response.data.agents, {});

			assert(_.isNumber(response.data.id));
			assert.strictEqual($store.master[response.data.id], undefined);
		});

		it('can not delete no such master.', async function () {
			try {
				await httpAgent.delete('/api/master/1');
			} catch (error) {
				assert.equal(error.response.status, 404);
			}
		});
	});

	describe('POST /api/window', function () {
		it('should a new agent be created.', async function () {
			const agent = Agent.create();
			const response = await httpAgent.post('/api/window', { agentId: agent.data.id });

			assert.notStrictEqual($store.window[response.data.id], undefined);
		});

		it('should be not created is agent is NOT found', async function () {
			try {
				await httpAgent.post('/api/window', { agentId: 123 });
			} catch (error) {
				assert.equal(error.response.status, 404);
			}
		});
	});

	describe('PUT /api/window/:windowId', function () {
		it('should be updated', async function () {
			const agent = Agent.create();
			const { data: windowData } = await httpAgent.post('/api/window', { agentId: agent.data.id });

			windowData.meta.title = 'title';
			windowData.meta.URL = 'URL';
			windowData.meta.domain = 'domain';
			windowData.meta.referrer = 'referrer';

			windowData.rect.top = 3;
			windowData.rect.left = 3;
			windowData.rect.width = 3;
			windowData.rect.height = 3;

			const response = await httpAgent.put(`/api/window/${windowData.id}`, windowData);

			assert.deepEqual(response.data, {
				id: windowData.id,
				agent: {
					id: agent.data.id,
					masterId: null,
					modifier: { ctrl: false, shift: false, alt: false, meta: false },
					pointer: { x: 0, y: 0 },
				},
				meta: { title: 'title', URL: 'URL', referrer: 'referrer', domain: 'domain' },
				program: {
					hash: null,
					name: null,
					args: [],
					error: null,
					// returnValue: undefined,
					isExited: true
				},
				rect: { top: 3, left: 3, width: 3, height: 3 }
			});
		});

		it('exit a program with returnValue', async function () {
			const agent = Agent.create();
			const { data: windowData } = await httpAgent.post('/api/window', { agentId: agent.data.id });
			const window = Window.select(windowData.id);
			
			window.callProgram('1234abcd', 'program.test', [1], 2000);

			const windowNextData = window.model;
			
			windowNextData.program.isExited = true;
			windowNextData.program.returnValue = 2;

			const response = await httpAgent.put(`/api/window/${windowData.id}`, windowNextData);
			
			assert.deepEqual(response.data, {
				id: windowData.id,
				agent: {
					id: agent.data.id,
					masterId: null,
					modifier: { ctrl: false, shift: false, alt: false, meta: false },
					pointer: { x: 0, y: 0 },
				},
				meta: { title: null, URL: null, referrer: null, domain: null },
				program: {
					hash: '1234abcd',
					name: 'program.test',
					args: [1],
					error: null,
					returnValue: 2,
					isExited: true
				},
				rect: { top: 0, left: 0, width: 0, height: 0 }
			});
		});
	});

	describe('DELETE /api/window/:windowId', function () {
		it('should be removed', async function () {
			const agent = Agent.create();
			const { data: windowData } = await httpAgent.post('/api/window', { agentId: agent.data.id });
			const response = await httpAgent.delete(`/api/window/${windowData.id}`);

			assert.strictEqual($store.window[response.data.id], undefined);
		});

		it('should be removed', async function () {
			try {
				await httpAgent.delete('/api/window/1234abcd');
			} catch (error) {
				assert.equal(error.response.status, 404);
			}
		});
	});

	describe('POST /api/window/:windowId/dialog', function () {
		it('alert timeout', async function () {
			const agent = Agent.create();
			const { data: windowData } = await httpAgent.post('/api/window', { agentId: agent.data.id });
			
			try {
				await httpAgent.post(`/api/window/${windowData.id}/dialog`, {
					type: 'alert',
					message: 'something wrong',
					timeout: 1000
				});
			} catch (error) {
				assert.equal(error.response.status, 504);
			}
		});

		it('should confirm be resolved', async function () {
			const agent = Agent.create();

			const { data: windowData } = await httpAgent.post('/api/window', { agentId: agent.data.id });
			const { data: masterData } = await httpAgent.post('/api/master', { agents: [agent.data.id] });
			
			setTimeout(async () => {
				const { data: masterNextData } = await httpAgent.put(`/api/master/${masterData.id}`, masterData);
	
				masterNextData.agents[agent.data.id].windows[0].dialog.alert.value = null;
				await httpAgent.put(`/api/master/${masterData.id}`, masterNextData);
			}, 1000);
			
			const { data } = await httpAgent.post(`/api/window/${windowData.id}/dialog`, {
				type: 'alert',
				message: 'something wrong',
				timeout: 3000
			});

			assert.equal(data.value, null);
		});
	});
});

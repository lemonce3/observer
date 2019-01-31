const assert = require('assert');
const axios = require('axios');

const cache = global.cache = require('../src/cache');

describe('API-master', function () {
	require('../');
	
	const masterIdReg = /[a-z0-9]{40}/;
	const masterAxios = axios.create({
		baseURL: `${config.serverName}/api`,
	});
	
	describe('POST /master', function () {

		it('should respond 200 & master entry', async function () {
			const response = await masterAxios.post('/master');
			const { data: master, status } = response;

			assert.equal(status, 200);
			assert(masterIdReg.test(master.id));
			assert(cache.master.get(master.id));
		});

	});

	describe('GET /master/:masterId', function () {

		this.beforeAll(async () => {
			const response = await masterAxios.post('/master');
			const { data: master } = response;

			this.masterId= master.id;
		});

		it('should get the specific master entry', async () => {
			const response = await masterAxios.get(`/master/${this.masterId}`);
			const { data: master, status } = response;

			assert.equal(status, 200);
			assert.deepEqual(master, {
				id: this.masterId,
				agents: []
			});
		});

		it('should get the same master in 10 secs', done => {
			setTimeout(async () => {
				const response = await masterAxios.get(`/master/${this.masterId}`);
				const { data: master, status } = response;
	
				assert.equal(status, 200);
				assert.deepEqual(master, {
					id: this.masterId,
					agents: []
				});

				done();
			}, 6000);
		});

		it('should get the same master in another 10 secs', done => {
			setTimeout(async () => {
				const response = await masterAxios.get(`/master/${this.masterId}`);
				const { data: master, status } = response;
	
				assert.equal(status, 200);
				assert.deepEqual(master, {
					id: this.masterId,
					agents: []
				});

				done();
			}, 6000);
		});

		it('should not found the master had been gone after 10 secs', done => {
			setTimeout(async () => {
				try {
					await masterAxios.get(`/master/${this.masterId}`);
				} catch ({ response }) {
					assert.equal(response.status, 404);
				}

				done();
			}, 12000);
		});
		
	});

	describe('DELETE /master/:masterId', function () {

		this.beforeAll(async () => {
			const response = await masterAxios.post('/master');
			const { data: master } = response;

			this.masterId= master.id;
		});

		it('should remove a specific master from cache', async () => {
			const response = await masterAxios.delete(`/master/${this.masterId}`);
			const { data: master, status } = response;

			assert.equal(status, 200);
			assert.deepEqual(master, {
				id: this.masterId,
				agents: []
			});
		});

		it('should not remove the master again & respond 404', async () => {
			try {
				await masterAxios.delete(`/master/${this.masterId}`);
			} catch ({ response }) {
				assert.equal(response.status, 404);
			}
		});
	});

	describe('POST /master/:masterId/log', function () {

		this.beforeAll(async () => {
			const response = await masterAxios.post('/master');
			const { data: master } = response;

			this.masterId= master.id;
		});

		it('should be appended a new log record without namespace', async () => {
			const response = await masterAxios.post(`/master/${this.masterId}/log`, {
				message: 'test'
			});
			const { data: log, status } = response;

			assert.equal(status, 200);
			assert.equal(log[1], '*');
			assert.equal(log[2], 'test');
		});

		it('should be appended a new log record with a namespace', async () => {
			const response = await masterAxios.post(`/master/${this.masterId}/log`, {
				message: 'test',
				namespace: 'test:test'
			});
			const { data: log, status } = response;

			assert.equal(status, 200);
			assert.equal(log[1], 'test:test');
			assert.equal(log[2], 'test');

			assert.equal(cache.master.peek(this.masterId).log.length, 2);
		});
	});

	describe('GET /master/:masterId/log', function () {

		this.beforeAll(async () => {
			const response = await masterAxios.post('/master');
			const { data: master } = response;

			this.masterId= master.id;
		});

		it('should get all log of the specific master', async () => {
			const first = await masterAxios.get(`/master/${this.masterId}/log`);

			assert.equal(first.data.length, 0);
			assert.equal(first.status, 200);

			await masterAxios.post(`/master/${this.masterId}/log`, { message: 'test' });
			await masterAxios.post(`/master/${this.masterId}/log`, { message: 'test' });
			await masterAxios.post(`/master/${this.masterId}/log`, { message: 'test' });
			await masterAxios.post(`/master/${this.masterId}/log`, { message: 'test' });
			await masterAxios.post(`/master/${this.masterId}/log`, { message: 'test' });

			const then = await masterAxios.get(`/master/${this.masterId}/log`);

			assert.equal(then.data.length, 5);
			assert.equal(then.status, 200);
		});
	});

	describe('DELETE /master/:masterId/log', function () {

		this.beforeAll(async () => {
			const response = await masterAxios.post('/master');
			const { data: master } = response;

			this.masterId= master.id;
		});

		it('should clear all log of the specific master', async () => {
			await masterAxios.post(`/master/${this.masterId}/log`, { message: 'test' });
			await masterAxios.post(`/master/${this.masterId}/log`, { message: 'test' });
			await masterAxios.post(`/master/${this.masterId}/log`, { message: 'test' });
			await masterAxios.post(`/master/${this.masterId}/log`, { message: 'test' });
			await masterAxios.post(`/master/${this.masterId}/log`, { message: 'test' });

			const read = await masterAxios.get(`/master/${this.masterId}/log`);

			assert.equal(read.data.length, 5);
			assert.equal(read.status, 200);

			const remove = await masterAxios.delete(`/master/${this.masterId}/log`);

			assert.equal(remove.data.length, 5);
			assert.equal(remove.status, 200);
			assert.equal(cache.master.peek(this.masterId).log.length, 0);
		});
	});

	describe('POST /master/:masterId/agent', function () {
		this.beforeAll(async () => {
			const response = await masterAxios.post('/master');
			const { data: master } = response;

			this.masterId= master.id;
		});

		it('should not bind success when no idle agent', async () => {
			try {
				await masterAxios.post(`/master/${this.masterId}/agent`);
			} catch ({ response: {status}}) {
				assert.equal(status, 409);
			}
		});

		it('should let a master bind a idle agent', async () => {
			await masterAxios.get('/agent/fetch');

			const { data: agent, status } =
				await masterAxios.post(`/master/${this.masterId}/agent`);

			assert.equal(status, 200);
			assert(agent);
		});
	});

	describe('DELETE /master/:masterId/agent/:agentId', function () {
		this.beforeAll(async () => {
			const { data: master } = await masterAxios.post('/master');
			this.masterId= master.id;

			await masterAxios.get('/agent/fetch');

			const { data: agent } = await masterAxios.post(`/master/${this.masterId}/agent`);
			this.agentId = agent.id;
		});

		it('should unbind a specific agent of the master', async () => {
			const { data: agent } =
				await masterAxios.delete(`/master/${this.masterId}/agent/${this.agentId}`);

			assert.equal(agent.id, this.agentId);
		});

		it('should not unbind an agent unbinded from the master', async () => {
			try {
				await masterAxios.delete(`/master/${this.masterId}/agent/${this.agentId}`);
			} catch ({ response: { status } }) {
				assert.equal(status, 404);
			}
		});
	});

	describe('POST /master/:masterId/agent/:agentId/window/:windowId/program', function () {
		
		this.beforeAll(async () => {
			const { data: master } = await masterAxios.post('/master');
			this.masterId= master.id;

			await masterAxios.get('/agent/fetch');

			const { data: agent } = await masterAxios.post(`/master/${master.id}/agent`);
			this.agentId = agent.id;
			
			const { data: window } = await masterAxios.post(`/agent/${agent.id}/window`);
			this.windowId = window.id;
		});

		it('should make a program calling to specific agent & window in the master', async () => {
			const url =
				`/master/${this.masterId}/agent/${this.agentId}/window/${this.windowId}/program`;

			const { data: program, status } = await masterAxios.post(url, {
				name: 'lang.object.get',
				args: ['name'],
				timeout: 12000
			});

			assert.equal(status, 200);
			assert(program);
		});
	});

	describe('GET /master/:masterId/agent/:agentId/window/:windowId/dialog/:dialogType', function () {
		this.beforeAll(async () => {
			const { data: master } = await masterAxios.post('/master');
			this.masterId= master.id;

			await masterAxios.get('/agent/fetch');

			const { data: agent } = await masterAxios.post(`/master/${master.id}/agent`);
			this.agentId = agent.id;
			
			const { data: window } = await masterAxios.post(`/agent/${agent.id}/window`);
			this.windowId = window.id;
		});
		
		it('should 404 when no specific type dialog', async () => {
			const url = `/master/${this.masterId}/agent/${this.agentId}/window/${this.masterId}/dialog/alert`;
			
			try {
				await masterAxios.get(url);

				assert(0);
			} catch ({ response }) {
				assert.equal(response.status, 404);
			}
		});
		
		it('should get specific type dialog', async () => {
			masterAxios.post(`/agent/${this.agentId}/window/${this.windowId}/dialog`, {
				type: 'prompt',
				message: 'test'
			}).catch(() => {});

			const url = `/master/${this.masterId}/agent/${this.agentId}/window/${this.windowId}/dialog/prompt`;
			const { data: masterDialog } = await masterAxios.get(url);

			assert.deepEqual(masterDialog, {
				type: 'prompt',
				message: 'test'
			});
		});
	});

	describe('POST /master/:masterId/agent/:agentId/window/:windowId/dialog/:dialogType/resolve', function () {
		
		this.beforeAll(async () => {
			const { data: master } = await masterAxios.post('/master');
			this.masterId= master.id;

			await masterAxios.get('/agent/fetch');

			const { data: agent } = await masterAxios.post(`/master/${master.id}/agent`);
			this.agentId = agent.id;
			
			const { data: window } = await masterAxios.post(`/agent/${agent.id}/window`);
			this.windowId = window.id;
		});

		it('should send ok when confirm dialog of window is being active', async () => {
			const window = cache.window.peek(this.windowId);
			const url = `/master/${this.masterId}/agent/${this.agentId}/window/${this.windowId}` +
				'/dialog/confirm/resolve';

			setTimeout(async () => {
				await masterAxios.post(url, {
					method: 'ok',
				});

				assert(1);
			}, 2000);

			const {
				data: dialogReturn
			} = await masterAxios.post(`/agent/${this.agentId}/window/${this.windowId}/dialog`, {
				type: 'confirm',
			});

			assert.equal(dialogReturn.value, true);
			assert.equal(window.dialog.confirm, null);
		});
	});

	describe('GET /program/:programId', function () {

		this.beforeAll(async () => {
			await masterAxios.get('/agent/fetch');

			const { data: master } = await masterAxios.post('/master');
			const { data: agent } = await masterAxios.post(`/master/${master.id}/agent`);
			const { data: window } = await masterAxios.post(`/agent/${agent.id}/window`);
			
			const {
				data: program,
			} = await masterAxios.post(`/master/${master.id}/agent/${agent.id}/window/${window.id}/program`, {
				name: 'lang.object.get',
				args: ['name'],
				timeout: 12000
			});

			this.programId = program.id;
		});

		it('should respond specific program & not found after 10 secs', async () => {
			const { data: program } = await masterAxios.get(`/program/${this.programId}`);

			assert.equal(program.id, this.programId);

			await new Promise(resolve => {
				setTimeout(async () => {
					try {
						await masterAxios.get(`/program/${this.programId}`);
					} catch ({ response: {status} }) {
						assert.equal(status, 404);
						resolve();
					}
				}, 12000);
			});
		});

	});
	

});
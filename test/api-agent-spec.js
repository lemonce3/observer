const axios = require('axios');
const assert = require('assert');

const cache = global.cache = require('../src/cache');

describe('API-agent', function () {
	require('../');

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
		const windowIdReg = /[a-f0-9]{40}/;

		this.beforeAll(async () => {
			const response = await agentAxios.get('/agent/fetch');
			const { headers } = response;
			
			assert.equal(headers['content-type'], 'text/html; charset=utf-8');
			assert(cookieStringReg.test(headers['set-cookie'][0]));

			this.agentId = headers['set-cookie'][0].match(cookieStringReg)[1];

			setInterval(() => {
				agentAxios.get('/agent/fetch', {
					headers: { cookie: `LC_AGENT=${this.agentId}` }
				});
			}, 2000);
		});

		it('should create a new window', async () => {
			const response = await agentAxios.post(`/agent/${this.agentId}/window`);
			const { data: window } = response;
			const { id, pointer, program } = window;
			
			assert(windowIdReg.test(id));
			assert.deepEqual(pointer, { x: 0, y: 0 });
			assert.equal(program, null);
		});

		it('should create another window behind last one in agent.window.list', async () => {
			const response = await agentAxios.post(`/agent/${this.agentId}/window`);
			const { data: window } = response;
			const { id } = window;

			const agent = cache.agent.peek(this.agentId);

			assert.equal(agent.windowRegistry.list.length, 2);
			assert.equal(agent.windowRegistry.list[1].id, id);
		});
	});

	describe('GET /agent/:agentId/window/:windowId', function () {
		this.beforeAll(async () => {
			const agentResponse = await agentAxios.get('/agent/fetch');
			const { headers } = agentResponse;
			
			assert.equal(headers['content-type'], 'text/html; charset=utf-8');
			assert(cookieStringReg.test(headers['set-cookie'][0]));

			this.agentId = headers['set-cookie'][0].match(cookieStringReg)[1];
			
			const windowResponse = await agentAxios.post(`/agent/${this.agentId}/window`);
			const { data: window } = windowResponse;

			this.windowId = window.id;
		});

		it('should be 200 & respond a window entry', async () => {
			const response = await agentAxios.get(`/agent/${this.agentId}/window/${this.windowId}`);
			const { data: window } = response;

			assert.equal(window.id, this.windowId);
		});

		it('should be found the window entry in 10 secs', (done) => {
			setTimeout(async () => {
				const response = await agentAxios.get(`/agent/${this.agentId}/window/${this.windowId}`);
				const { data: window } = response;
	
				assert.equal(window.id, this.windowId);
				done();
			}, 8000);
		});

		it('should be found the window entry in another 10 secs', (done) => {
			setTimeout(async () => {
				const response = await agentAxios.get(`/agent/${this.agentId}/window/${this.windowId}`);
				const { data: window } = response;
	
				assert.equal(window.id, this.windowId);
				done();
			}, 8000);
		});

		it('should be auto-removed after more than 10 secs', (done) => {
			setTimeout(async () => {
				try {
					await agentAxios.get(`/agent/${this.agentId}/window/${this.windowId}`);
				} catch ({ response }) {
					assert.equal(response.status, 404);
				}
	
				done();
			}, 13000);
		});
	});

	describe('DELETE /agent/:agentId/window/:windowId', function () {
		this.beforeAll(async () => {
			const agentResponse = await agentAxios.get('/agent/fetch');
			const { headers } = agentResponse;
			
			assert.equal(headers['content-type'], 'text/html; charset=utf-8');
			assert(cookieStringReg.test(headers['set-cookie'][0]));

			this.agentId = headers['set-cookie'][0].match(cookieStringReg)[1];
			
			const windowResponse = await agentAxios.post(`/agent/${this.agentId}/window`);
			const { data: window } = windowResponse;

			this.windowId = window.id;
		});

		it('should respond the removed window & not found when get again', async () => {
			const response = await agentAxios.delete(`/agent/${this.agentId}/window/${this.windowId}`);
			const { data: window } = response;
			
			assert.equal(window.id, this.windowId);

			try {
				await agentAxios.get(`/agent/${this.agentId}/window/${this.windowId}`);
			} catch ({ response }) {
				assert.equal(response.status, 404);
			}
		});

		async function postWindow(agentId) {
			const { data } = await agentAxios.post(`/agent/${agentId}/window`);

			return data.id;
		}

		async function deleteWindow(agentId, windowId) {
			const { data } = await agentAxios.delete(`/agent/${agentId}/window/${windowId}`);

			return data.id;
		}

		it('should [B, C] in agent.window.list "+A +B -A +C +D -D"', async () => {
			const agentResponse = await agentAxios.get('/agent/fetch');
			const { headers } = agentResponse;
			
			assert.equal(headers['content-type'], 'text/html; charset=utf-8');
			assert(cookieStringReg.test(headers['set-cookie'][0]));

			const agentId = headers['set-cookie'][0].match(cookieStringReg)[1];

			const A = await postWindow(agentId);
			const B = await postWindow(agentId);
			await deleteWindow(agentId, A);
			const C = await postWindow(agentId);
			const D = await postWindow(agentId);
			await deleteWindow(agentId, D);

			const agent = cache.agent.get(agentId);

			assert.equal(agent.windowRegistry.list[0].id, B);
			assert.equal(agent.windowRegistry.list[1].id, C);

			assert(agent.windowRegistry.idIndex.hasOwnProperty(B));
			assert(agent.windowRegistry.idIndex.hasOwnProperty(C));
		});
	});

	describe('POST /agent/:agentId/window/:windowId/program/:programId/exit', function () {
		this.beforeAll(async () => {
			const agentResponse = await agentAxios.get('/agent/fetch');
			const { headers } = agentResponse;
			
			assert.equal(headers['content-type'], 'text/html; charset=utf-8');
			assert(cookieStringReg.test(headers['set-cookie'][0]));

			this.agentId = headers['set-cookie'][0].match(cookieStringReg)[1];
			
			const windowResponse = await agentAxios.post(`/agent/${this.agentId}/window`);
			const { data: window } = windowResponse;

			this.windowId = window.id;
		});

		it('should post a returnValue', async () => {
			const program = cache.createProgram(this.agentId, this.windowId, {
				name: 'test',
				args: [],
				timeout: 10000
			});

			const url = `/agent/${this.agentId}/window/${this.windowId}/program/${program.id}/exit`;
			const response = await agentAxios.post(url, {
				returnValue: {
					isObject: false,
					value: null
				}
			});

			const { data } = response;

			assert.deepEqual(data, {
				id: program.id,
				name: 'test',
				args: [],
				returnValue: {
					isObject: false,
					value: null
				},
				error: null
			});
		});

		it('should post a error', async () => {
			const program = cache.createProgram(this.agentId, this.windowId, {
				name: 'test',
				args: [],
				timeout: 10000
			});

			const url = `/agent/${this.agentId}/window/${this.windowId}/program/${program.id}/exit`;
			const response = await agentAxios.post(url, {
				error: {
					type: 'RuntimeError',
					message: 'test',
					stack: []
				}
			});

			const { data } = response;

			assert.deepEqual(data, {
				id: program.id,
				name: 'test',
				args: [],
				returnValue: null,
				error: {
					type: 'RuntimeError',
					message: 'test',
					stack: []
				}
			});

		});

	});
});
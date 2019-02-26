const assert = require('assert');
const db = require('../src/model/base');
const $store = require('../src/model/base/store');
const { Agent, Master, Window } = require('../src/model');

describe('object::', function () {

	this.afterEach(function () {
		$store.master = {};
		$store.agent = {};
		$store.program = {};
		$store.window = {};
	});

	describe.only('Agent', function () {
		it('should create a master successfully', function () {
			const agent = Agent.create();
			const agentData = agent.data;

			assert.equal($store.agent[agentData.id], agentData);
			assert.deepStrictEqual(agentData, {
				id: agentData.id,
				createdAt: agentData.createdAt,
				visitedAt: agentData.visitedAt,
				masterId: null,
				modifier: {
					ctrl: false,
					shift: false,
					alt: false,
					meta: false
				},
				pointer: {
					x: 0,
					y: 0
				},
				windows: []
			});
		});

		it('should destroy a master successfully', function () {
			const agent = Agent.create();
			const agentData = agent.data;

			assert.equal($store.agent[agentData.id], agentData);

			agent.destroy();

			assert.equal($store.agent[agentData.id], undefined);
		});

		it('should select a agent by id successlly', function () {
			const createdAgent = Agent.create();
			const agentData = createdAgent.data;

			const queriedAgent = Agent.selectById(agentData.id);

			assert.notStrictEqual(createdAgent, queriedAgent);
			assert.strictEqual(createdAgent.data, queriedAgent.data);
		});

		it('should select all agent successlly', function () {
			assert.strictEqual(Agent.selectAll().length, 0);
			const agent = Agent.create();
			assert.strictEqual(Agent.selectAll().length, 1);
			agent.destroy();
			assert.strictEqual(Agent.selectAll().length, 0);
		});

		it('should set a new visit time by `agent.visit()`.', function (done) {
			const agent = Agent.create();
			const agentData = agent.data;

			assert(Date.now() - agentData.visitedAt < 10);
			
			setTimeout(() => {
				agent.visit();

				assert(Date.now() - agentData.visitedAt < 10);
				assert(agentData.createdAt - agentData.visitedAt < 10);

				done();
			}, 2000);
		});

		it('should update a agent successlly', function () {
			const agent = Agent.create();
			const agentData = agent.data;

			agent.update({
				modifier: {
					ctrl: true,
					shift: true,
					alt: true,
					meta: true
				},
				pointer: {
					x: 883,
					y: 784
				},
			});

			assert.deepStrictEqual(agentData, {
				id: agentData.id,
				createdAt: agentData.createdAt,
				visitedAt: agentData.visitedAt,
				masterId: null,
				modifier: {
					ctrl: true,
					shift: true,
					alt: true,
					meta: true
				},
				pointer: {
					x: 883,
					y: 784
				},
				windows: []
			});
		});
	});

	describe('Window', function () {
		it('should create a window successfully.', function () {
			const agent = Agent.create();
			const window = Window.create(agent.data.id);
			const agentData = agent.data;
			const windowId = window.data.id;

			assert.deepStrictEqual(agentData.windows, [window.data.id]);
			assert.deepStrictEqual($store.window[windowId], {
				id: windowId,
				agentId: agentData.id,
				createdAt: $store.window[windowId].createdAt,
				visitedAt: null,
				programId: null,
				meta: {
					URL: null,
					domain: null,
					referrer: null,
					title: null,
				},
				rect: {
					width: 0,
					height: 0,
					top: 0,
					left: 0
				},
				dialog: {
					alert: null,
					confirm: null,
					prompt: null
				}
			});
		});

		it('should update a window successfully', function () {
			const agent = Agent.create();
			const window = Window.create(agent.data.id);

			const windowId = window.data.id;
			const testString = 'test';

			window.update({
				meta: {
					title: testString,
					URL: testString,
					referrer: testString,
					domain: testString
				},
				rect: {
					width: 1,
					height: 1,
					top: 1,
					left: 1
				}
			});

			assert.deepStrictEqual($store.window[windowId], {
				id: windowId,
				agentId: agent.data.id,
				createdAt: window.data.createdAt,
				visitedAt: null,
				programId: null,
				meta: {
					URL: testString,
					domain: testString,
					referrer: testString,
					title: testString,
				},
				rect: {
					width: 1,
					height: 1,
					top: 1,
					left: 1
				},
				dialog: {
					alert: null,
					confirm: null,
					prompt: null
				}
			});
		});

		it('should destroy a window successfully', function () {
			const agent = Agent.create();
			const window = Window.create(agent.data.id);
			const agentData = agent.data;
			const windowId = window.data.id;

			assert.deepStrictEqual(agentData.windows, [window.data.id]);
			assert.strictEqual($store.window[windowId], window.data);

			window.destroy();

			assert.strictEqual($store.window[windowId], undefined);
		});

		it('should selet a window successfully', function () {
			const agent = Agent.create();
			const window = Window.create(agent.data.id);
			const agentData = agent.data;
			const windowId = window.data.id;

			assert.deepStrictEqual(agentData.windows, [window.data.id]);
			assert.strictEqual($store.window[windowId], window.data);
			
			const queriedWindow = Window.select(window.data.id);

			assert.notEqual(window, queriedWindow);
			assert.strictEqual(window.data, queriedWindow.data);
		});
	});

	describe('Master', function () {
		it('should create a master successfully', function () {
			const master = Master.create();
			const masterData = master.data;

			assert.equal($store.master[masterData.id], masterData);
		});
	});
});
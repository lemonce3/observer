const assert = require('assert');
const db = require('../src/model/base');
const $store = require('../src/model/base/store');
const { Agent, Master, Window, Program } = require('../src/model');

describe('object::', function () {

	this.afterEach(function () {
		$store.master = {};
		$store.agent = {};
		$store.program = {};
		$store.window = {};
	});

	describe('Agent', function () {
		describe('create()', function () {
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
		});

		describe('select()', function () {
			it('should select a agent by id successlly', function () {
				const createdAgent = Agent.create();
				const agentData = createdAgent.data;
	
				const queriedAgent = Agent.selectById(agentData.id);
	
				assert.notStrictEqual(createdAgent, queriedAgent);
				assert.strictEqual(createdAgent.data, queriedAgent.data);
			});
		});

		describe('selectAll()', function () {
			it('should select all agent successlly', function () {
				assert.strictEqual(Agent.selectAll().length, 0);
				const agent = Agent.create();
				assert.strictEqual(Agent.selectAll().length, 1);
				agent.destroy();
				assert.strictEqual(Agent.selectAll().length, 0);
			});
		});

		describe('#destroy()', function () {
			it('should destroy a master successfully', function () {
				const agent = Agent.create();
				const agentData = agent.data;
	
				assert.equal($store.agent[agentData.id], agentData);
	
				agent.destroy();
	
				assert.equal($store.agent[agentData.id], undefined);
			});
		});

		describe('#visit()', function () {
			it('should set a new visit time by `agent.visit()`.', function (done) {
				const agent = Agent.create();
				const agentData = agent.data;
	
				assert(Date.now() - agentData.visitedAt < 10);
				
				setTimeout(() => {
					agent.visit();
	
					assert(Date.now() - agentData.visitedAt < 10);
					assert(agentData.visitedAt - agentData.createdAt < 2100);
	
					done();
				}, 2000);
			});
		});

		describe('#update()', function () {
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
	});

	describe('Window', function () {
		describe('create()', function () {
			it('should be created.', function () {
				const agent = Agent.create();
				const window = Window.create(agent.data.id);
				const agentData = agent.data;
				const windowId = window.data.id;
	
				assert.deepStrictEqual(agentData.windows, [window.data.id]);
				assert.deepStrictEqual($store.window[windowId], {
					id: windowId,
					agentId: agentData.id,
					createdAt: window.data.createdAt,
					visitedAt: window.data.visitedAt,
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
		});

		describe('select()', function () {
			it('should be selected by id', function () {
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

		describe('#update()', function () {
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
					visitedAt: window.data.createdAt,
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
		});

		describe('#destroy()', function () {
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
		});
		
		describe('#visit()', function () {
			it('should update visitedAt after `window.visit()` called.', function (done) {
				const agent = Agent.create();
				const window = Window.create(agent.data.id);
				const windowData = window.data;

				assert(Date.now() - windowData.visitedAt < 10);
				
				setTimeout(() => {
					window.visit();
	
					assert(Date.now() - windowData.visitedAt < 10);
					assert(windowData.visitedAt - windowData.createdAt < 2100);
	
					done();
				}, 2000);
			});
		});

		describe('#openDialog()', function () {
			it('should window is able to open dialog.', function () {
				const agent = Agent.create();
				const window = Window.create(agent.data.id);
				const ticket = '1234abcd';
				
				window.openDialog('alert', 'test message', ticket);

				assert.deepEqual(window.data.dialog, {
					alert: {
						message: 'test message',
						ticket
					},
					confirm: null,
					prompt: null
				});
			});
		});

		describe('#closeDialog()', function () {
			it('should window is able to close dialog.', function () {
				const agent = Agent.create();
				const window = Window.create(agent.data.id);
				const ticket = '1234abcd';
				
				window.openDialog('alert', 'test message', ticket);

				assert.equal(window.closeDialog('alert'), ticket);
				assert.deepEqual(window.data.dialog, {
					alert: null,
					confirm: null,
					prompt: null
				});
			});
		});

		describe('#model', function () {
			let window;

			it('Without program.', function () {

			});

			it('With program.', function () {
				
			});
		});
	});

	describe('Master', function () {
		describe('create()', function () {
			it('should be created', function () {
				const master = Master.create();
				const masterData = master.data;
	
				assert.equal($store.master[masterData.id], masterData);
				assert.equal(masterData.createdAt, masterData.visitedAt);

				assert.deepEqual(masterData, {
					id: masterData.id,
					createdAt: masterData.createdAt,
					visitedAt: masterData.visitedAt,
					agents: {},
					programs: {},
					log: []
				});
			});
		});

		describe('select()', function () {
			it('should be selected by id.', function () {
				const master = Master.create();
				const queriedMaster = Master.select(master.data.id);

				assert.equal(queriedMaster.data, master.data);
				assert.notEqual(master, queriedMaster);
			});
		});

		describe('#destroy()', function () {
			it('should be destroyed.', function () {
				const master = Master.create();
				const masterData = master.data;

				assert.equal($store.master[masterData.id], masterData);
				master.destroy();
				assert.strictEqual($store.master[masterData.id], undefined);
			});
		});

		describe('#bind()', function () {
			it('can bind the agent by agentId.', function () {
				const master = Master.create();
				const agent = Agent.create();

				master.bind(agent.data.id);

				const masterData = master.data;

				assert.strictEqual(masterData.agents[agent.data.id], true);
				assert.strictEqual(agent.data.masterId, masterData.id);
			});
		});

		describe('#unbind()', function () {
			it('can unbind the agent by agentId.', function () {
				const master = Master.create();
				const agent = Agent.create();

				const masterData = master.data;
				const agentData = agent.data;

				master.bind(agentData.id);
				master.unbind(agentData.id);
				
				assert.strictEqual(masterData.agents[agent.data.id], undefined);
				assert.strictEqual(agent.data.masterId, null);
			});
		});

		describe('#visit()', function () {
			it('should be visited', function (done) {
				const master = Master.create();
				const masterData = master.data;

				assert(Date.now() - masterData.visitedAt < 10);
				
				setTimeout(() => {
					master.visit();
	
					assert(Date.now() - masterData.visitedAt < 10);
					assert(masterData.visitedAt - masterData.createdAt < 2100);
	
					done();
				}, 2000);
			});
		});

		describe('#model', function () {
			it('model structure of master is in expected.');
		});
	});

	describe('Program', function () {
		describe('create()', function () {

			it('should be created', function () {
				const master = Master.create();
				const agent = Agent.create();
				const window = Window.create(agent.data.id);

				master.bind(agent.data.id);

				const program = Program.create({
					windowId: window.data.id,
					masterId: master.data.id,
					name: 'program.test',
					args: []
				});

				assert.strictEqual(program.data.windowId, window.data.id);
				assert.strictEqual(program.data.masterId, master.data.id);
				assert.strictEqual(master.data.programs[program.data.id], true);
				assert.strictEqual(window.data.programId, program.data.id);
			});

		});

		describe('select()', function () {
			it('should be selected by id', function () {
				const master = Master.create();
				const agent = Agent.create();
				const window = Window.create(agent.data.id);

				master.bind(agent.data.id);

				const program = Program.create({
					windowId: window.data.id,
					masterId: master.data.id,
					name: 'program.test',
					args: []
				});

				const queriedProgram = Program.select(program.data.id);

				assert.strictEqual(program.data, queriedProgram.data);
				assert.notEqual(program, queriedProgram);
			});
		});

		describe('#destroy()', function () {
			it('can destroy', function () {
				const master = Master.create();
				const agent = Agent.create();
				const window = Window.create(agent.data.id);

				master.bind(agent.data.id);

				const program = Program.create({
					windowId: window.data.id,
					masterId: master.data.id,
					name: 'program.test',
					args: []
				});
				
				program.destroy();

				assert.strictEqual($store.program[program.data.id], undefined);
			});
		});

		describe('#exit()', function() {
			let program;

			this.beforeEach(function () {
				const master = Master.create();
				const agent = Agent.create();
				const window = Window.create(agent.data.id);

				master.bind(agent.data.id);

				program = Program.create({
					windowId: window.data.id,
					masterId: master.data.id,
					name: 'program.test',
					args: []
				});
			});

			it('can exit with error', function () {
				assert.strictEqual(program.data.exitedAt, null);

				program.exit('Testing error message');

				assert.notEqual(program.data.exitedAt, null);
				assert.deepEqual(program.data.error, {
					name: 'agent',
					message: 'Testing error message'
				});
			});

			it('can exit without error', function () {
				assert.strictEqual(program.data.exitedAt, null);

				program.exit('Testing error message');

				assert.notEqual(program.data.exitedAt, null);
				assert.deepEqual(program.data.error, {
					name: 'agent',
					message: 'Testing error message'
				});
			});
		});
	});
});
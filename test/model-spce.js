const assert = require('assert');
const $store = require('../src/model/base/store');
const { Agent, Master, Window } = require('../src/model');

describe('object::', function () {

	this.afterEach(function () {
		$store.master = {};
		$store.agent = {};
		$store.window = {};
		$store.program = {};
	});

	describe('Agent', function () {
		describe('create()', function () {
			it('should create a master successfully', function () {
				const agent = Agent.create('test ua');
				const agentData = agent.data;
	
				assert.equal($store.agent[agentData.id], agentData);
				assert.deepStrictEqual(agentData, {
					id: agentData.id,
					ua: 'test ua',
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
					ua: null,
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
					program: null,
					meta: { URL: null, domain: null, referrer: null, title: null },
					rect: { width: 0, height: 0, top: 0, left: 0 },
					dialog: { alert: null, confirm: null, prompt: null },
					upload: {
						pending: false,
						fileList: []
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
					meta: { title: testString, URL: testString, referrer: testString, domain: testString },
					rect: { width: 1, height: 1, top: 1, left: 1 },
					upload: { pending: true, fileList: [] }
				});
	
				assert.deepStrictEqual($store.window[windowId], {
					id: windowId,
					agentId: agent.data.id,
					createdAt: window.data.createdAt,
					visitedAt: window.data.createdAt,
					program: null,
					meta: {
						URL: testString,
						domain: testString,
						referrer: testString,
						title: testString,
					},
					upload: {
						pending: true,
						fileList: []
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

			it('empty upload fileList to [] if set pending false');
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

		describe('#upload', function () {
			it('should upload when pending');
			it('should NOT upload when not pending');
		});

		describe('#callProgram', function () {
			it('call a new program on the last has been exited.', function () {
				const agent = Agent.create();
				const window = Window.create(agent.data.id);
				const master = Master.create();

				master.bind(agent.data.id);
				
				window.callProgram('1234', 'program.test', [], 5000);

				const programData = $store.program[1234];

				assert.deepEqual(programData, {
					hash: '1234',
					name: 'program.test',
					args: [],
					error: null,
					returnValue: undefined,
					calledAt: programData.calledAt,
					masterId: master.data.id,
					windowId: window.data.id,
					exitedAt: null
				});
			});

			it('should throw error if the last has NOT been exited.', function () {
				assert.throws(() => {
					const agent = Agent.create();
					const window = Window.create(agent.data.id);
					const master = Master.create();

					master.bind(agent.data.id);
					
					window.callProgram('1234', 'program.test', []);
					window.callProgram('abcd', 'program.busy', []);
				}, {
					message: 'Window is busy with program.'
				});
			});

			it('should timeout if no exit in 1 sec.', function (done) {
				const agent = Agent.create();
				const window = Window.create(agent.data.id);
				const master = Master.create();
				
				master.bind(agent.data.id);

				window.callProgram('1234', 'program.test', [], 1000);

				const programData = $store.program[1234];

				setTimeout(() => {
					assert.deepEqual(programData, {
						hash: '1234',
						name: 'program.test',
						args: [],
						exitedAt: programData.exitedAt,
						calledAt: programData.calledAt,
						masterId: master.data.id,
						windowId: window.data.id,
						error: {
							name: 'observer',
							message: 'The program execution is timeout or no response.'
						},
						returnValue: undefined,
					});

					assert.strictEqual(window.data.program, null);
					assert.deepEqual(master.data.programs, ['1234']);

					done();
				}, 1500);
			});
		});

		describe('#exitProgram', function () {
			it('should exit with a returnValue.', function () {
				const agent = Agent.create();
				const window = Window.create(agent.data.id);
				const master = Master.create();

				master.bind(agent.data.id);
				
				window.callProgram('1234', 'program.test', []);

				const programData = $store.program[1234];

				window.exitProgram(null, 'anything');
				assert.strictEqual(window.programWatcher, null);
				assert.deepEqual(programData, {
					hash: '1234',
					name: 'program.test',
					args: [],
					exitedAt: programData.exitedAt,
					calledAt: programData.calledAt,
					masterId: master.data.id,
					windowId: window.data.id,
					error: null,
					returnValue: 'anything',
				});
			});

			it('should exit with a error.', function () {
				const agent = Agent.create();
				const window = Window.create(agent.data.id);
				const master = Master.create();

				master.bind(agent.data.id);
				
				window.callProgram('1234', 'program.test', []);

				const programData = $store.program[1234];

				window.exitProgram('something wrong');
				assert.deepEqual(programData, {
					hash: '1234',
					name: 'program.test',
					args: [],
					exitedAt: programData.exitedAt,
					calledAt: programData.calledAt,
					masterId: master.data.id,
					windowId: window.data.id,
					error: {
						name: 'agent',
						message: 'something wrong'
					},
					returnValue: undefined,
				});
			});

			it('should NOT exit if no program running.', function () {
				const agent = Agent.create();
				const window = Window.create(agent.data.id);
				const master = Master.create();

				master.bind(agent.data.id);
				
				window.callProgram('1234', 'program.test', []);
				window.exitProgram('something wrong');
				
				assert.throws(() => {
					window.exitProgram('something wrong');
				}, {
					message: 'No program is invoking.'
				});
			});
		});

		describe('#model', function () {
			it('Without program.', function () {
				const agent = Agent.create();
				const window = Window.create(agent.data.id);

				assert.deepStrictEqual(window.model, {
					id: window.data.id,
					meta: { title: null, URL: null, domain: null, referrer: null },
					rect: { width: 0, height: 0, top: 0, left: 0 },
					program: null,
					agent: {
						id: agent.data.id,
						masterId: null,
						modifier: { ctrl: false, shift: false, alt: false, meta: false },
						pointer: { x: 0, y: 0 }
					},
					upload: { pending: false, fileList: [] }
				});
			});

			it('With program.', function () {
				const master = Master.create();
				const agent = Agent.create();
				const window = Window.create(agent.data.id);

				master.bind(agent.data.id);
				window.callProgram('1234', 'program.test');

				assert.deepStrictEqual(window.model, {
					id: window.data.id,
					meta: { title: null, URL: null, domain: null, referrer: null },
					rect: { width: 0, height: 0, top: 0, left: 0 },
					program: {
						hash: '1234',
						name: 'program.test',
						args: [],
						error: null,
						returnValue: undefined,
					},
					agent: {
						id: agent.data.id,
						masterId: master.data.id,
						modifier: { ctrl: false, shift: false, alt: false, meta: false },
						pointer: { x: 0, y: 0 }
					},
					upload: { pending: false, fileList: [] }
				});
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
					programs: [],
					agents: {},
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
			it('model structure of master is in expected.', function () {
				const master = Master.create();
				const agent1 = Agent.create();
				const agent2 = Agent.create();
				const window = Window.create(agent1.data.id);

				master.bind(agent1.data.id);
				master.bind(agent2.data.id);
				window.callProgram('1234', 'program.test');
				window.openDialog('confirm', 'countinue?', '1234abcd');

				assert.deepStrictEqual(master.model, {
					id: master.data.id,
					programs: {
						'1234': {
							hash: '1234',
							name: 'program.test',
							args: [],
							isExited: false,
							error: null,
							returnValue: undefined,
							windowId: window.data.id,
						}
					},
					agents: {
						[agent1.data.id]: {
							id: agent1.data.id,
							ua: null,
							modifier: { alt: false, ctrl: false, meta: false, shift: false },
							pointer: { x: 0, y: 0 },
							windows: [
								{
									id: window.data.id,
									program: '1234',
									meta: { URL: null, domain: null, referrer: null, title: null },
									rect: { height: 0, width: 0, top: 0, left: 0 },
									dialog: {
										alert: null,
										confirm: {
											message: 'countinue?',
											ticket: '1234abcd'
										},
										prompt: null
									},
									upload: { pending: false, fileList: [] }
								}
							]
						},
						[agent2.data.id]: {
							id: agent2.data.id,
							ua: null,
							modifier: { alt: false, ctrl: false, meta: false, shift: false },
							pointer: { x: 0, y: 0 },
							windows: []
						}
					}
				});
			});
		});

		describe('#deleteProgram', function () {
			it('could delete a exited program');
			it('could NOT delete a exited program');
		});
	});
});
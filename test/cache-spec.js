const assert = require('assert');
const _ = require('lodash');
const cache = require('../src/cache');

describe('Class with cache', function () {

	it('should put a new master', () => {
		const newMaster = cache.createMaster();

		assert.equal(cache.master.get(newMaster.id).id, newMaster.id);
	});

	it('should keep master alive in 10 secs interval getting', function (done) {
		const master = cache.createMaster();

		setTimeout(() => {
			assert.equal(master.id, cache.master.get(master.id).id);
		}, 6000);

		setTimeout(() => {
			assert.equal(master.id, cache.master.get(master.id).id);
		}, 12000);

		setTimeout(() => {
			assert.equal(undefined, cache.master.get(master.id));

			done();
		}, 24000);
	});

	it('should put a new agent & it can be get by getIdleAgent.', () => {
		const agent = cache.createAgent();

		assert.equal(cache.agent.get(agent.id).id, agent.id);
		assert.equal(cache.getIdleAgent().id, agent.id);
	});

	it('shoud keep agent alive in 10 secs interval getting', function (done) {
		const agent = cache.createAgent();

		setTimeout(() => {
			assert.equal(cache.agent.get(agent.id).id, agent.id);
		}, 6000);

		setTimeout(() => {
			assert.equal(cache.agent.get(agent.id).id, agent.id);
		}, 12000);

		setTimeout(() => {
			assert.equal(cache.agent.get(agent.id), undefined);

			done();
		}, 24000);
	});

	it('should a master be able to bind a idle agent', function () {
		cache.agent.reset();

		const agent = cache.createAgent();
		const master = cache.createMaster();

		const masterInstance = cache.master.get(master.id);
		const agentInstance = cache.agent.get(agent.id);
		
		masterInstance.bind('test', agentInstance);

		assert.equal(agentInstance.master.id, master.id);
		assert.equal(masterInstance.getAgentByName('test').id, agent.id);
		assert.equal(cache.getIdleAgent(), undefined);
	});

	it('should auto unbind after 10 secs', function (done) {
		const agent = cache.createAgent();
		const master = cache.createMaster();

		const agentInstance = cache.agent.peek(agent.id);
		const masterInstance = cache.master.peek(master.id);
		masterInstance.bind('test', agentInstance);

		assert.equal(agentInstance.master, masterInstance);
		assert.equal(masterInstance.getAgentByName('test'), agentInstance);

		setTimeout(() => {
			assert.equal(agentInstance.master, masterInstance);
			assert.equal(masterInstance.getAgentByName('test'), agentInstance);
		}, 3000);

		setTimeout(() => {
			const agent = cache.agent.get(agentInstance.id);
			const master = cache.master.get(masterInstance.id);

			assert.equal(agent, undefined);
			assert.equal(master, undefined);

			assert.strictEqual(agentInstance.master, null);
			assert.strictEqual(masterInstance.getAgentByName('test'), undefined);

			done();
		}, 14000);
	});

	it('should put a new window by agent', function () {
		const agent = cache.createAgent();
		const window = cache.createWindow(agent.id);

		const agentInstance = cache.agent.peek(agent.id);
		const windowInstance= cache.window.peek(window.id);

		assert.equal(agentInstance.windowRegistry.list[0], windowInstance);
		assert.equal(agentInstance.windowRegistry.idIndex[window.id], windowInstance);
		assert.equal(agentInstance.getWindow(window.id), windowInstance);
		assert.equal(agentInstance.queryWindow(), windowInstance);
		assert.equal(agentInstance.queryWindow(0), windowInstance);
	});

	it('should shoud keep window alive in 10 secs interval getting with agent', function (done) {
		const agent = cache.createAgent();
		const window = cache.createWindow(agent.id);

		const windowInstance = cache.window.peek(window.id);

		setTimeout(() => {
			cache.getAgent(agent.id);
			assert.equal(cache.window.get(window.id), windowInstance);
		}, 6000);

		setTimeout(() => {
			cache.getAgent(agent.id);
			assert.equal(cache.window.get(window.id), windowInstance);
		}, 12000);

		setTimeout(() => {
			cache.getAgent(agent.id);
			assert.strictEqual(cache.getWindow(window.id), undefined);

			done();
		}, 24000);
	});

	it('should put a new program to a window', function () {
		const agent = cache.createAgent();
		const window = cache.createWindow(agent.id);
		const program = cache.createProgram(agent.id, window.id, {
			name: 'test',
			args: [1]
		});

		assert.equal(cache.getProgram(program.id).id, program.id);
		assert.deepEqual(program, {
			id: program.id,
			name: 'test',
			args: [1],
			returnValue: null,
			error: null
		});
	});

	it('should not be able to execute a new program when the window is busy', function () {
		const agent = cache.createAgent();
		const window = cache.createWindow(agent.id);

		cache.createProgram(agent.id, window.id, {
			name: 'test',
			args: [1]
		});

		assert.throws(() => {
			cache.createProgram(agent.id, window.id, {
				name: 'test',
				args: [2]
			});
		});
	});

	it('should be program can exit when timeout assigned', function (done) {
		const agent = cache.createAgent();
		const window = cache.createWindow(agent.id);

		const program = cache.createProgram(agent.id, window.id, {
			name: 'test',
			args: [1],
			timeout: 3000
		});

		assert.strictEqual(cache.program.get(program.id).id, program.id);

		setTimeout(() => {
			assert.strictEqual(cache.program.get(program.id), undefined);

			done();
		}, 4000);
	});

	it('should be program can exit when timeout(10s) is not assigned', function (done) {
		const agent = cache.createAgent();
		const window = cache.createWindow(agent.id);

		const program = cache.createProgram(agent.id, window.id, {
			name: 'test',
			args: [1]
		});

		assert.strictEqual(cache.program.get(program.id).id, program.id);

		setTimeout(() => {
			assert.strictEqual(cache.program.get(program.id), undefined);

			done();
		}, 11000);
	});
	
	it('should be program can exit when returnValue is assigned', function (done) {
		const agent = cache.createAgent();
		const window = cache.createWindow(agent.id);

		const program = cache.createProgram(agent.id, window.id, {
			name: 'test',
			args: [1]
		});

		assert.strictEqual(cache.program.get(program.id).id, program.id);
		assert.deepEqual(cache.getWindow(window.id), {
			id: window.id,
			program: {
				name: 'test',
				args: [1]
			},
			pointer: { x: 0, y: 0},
			meta: {}
		});

		setTimeout(() => {
			cache.exitProgram(program.id, {
				returnValue: {
					isObject: false,
					value: 12345
				}
			});

			assert.deepEqual(cache.getProgram(program.id), {
				id: program.id,
				name: 'test',
				args: [1],
				returnValue: {
					isObject: false,
					value: 12345
				},
				error: null
			});

			assert.strictEqual(window.program, null);
			
			done();
		}, 3000);
	});

	it('should be program can exit when error is assigned', function (done) {
		const agent = cache.createAgent();
		const window = cache.createWindow(agent.id);

		const program = cache.createProgram(agent.id, window.id, {
			name: 'test',
			args: [2]
		});

		assert.strictEqual(cache.program.get(program.id).id, program.id);
		assert.deepEqual(cache.getWindow(window.id), {
			id: window.id,
			program: {
				name: 'test',
				args: [2]
			},
			pointer: { x: 0, y: 0},
			meta: {}
		});

		setTimeout(() => {
			cache.exitProgram(program.id, {
				error: {
					type: 'RuntimeError',
					message: 'test',
					stack: []
				}
			});

			assert.deepEqual(cache.getProgram(program.id), {
				id: program.id,
				name: 'test',
				args: [2],
				returnValue: null,
				error: {
					type: 'RuntimeError',
					message: 'test',
					stack: []
				}
			});

			assert.strictEqual(window.program, null);
			
			done();
		}, 3000);

	});
	
});
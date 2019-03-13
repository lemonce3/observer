const assert = require('assert');
const db = require('../src/model/base');
const $store = require('../src/model/base/store');

function WindowId() {
	return Math.random().toString(16).substr(2, 8);
}

describe('database::', function () {
	this.afterEach(function () {
		$store.master = {};
		$store.agent = {};
		$store.window = {};
		$store.program = {};
	});

	it('should create a master correctly.', function () {
		const masterData = db.master.add();

		assert.equal($store.master[masterData.id], masterData);
	});

	it('should create a agent correctly', function () {
		const agentData = db.agent.add();

		assert.equal($store.agent[agentData.id], agentData);
	});

	it('should create a window to existed agent correctly.', function () {
		const agentData = db.agent.add();
		const windowData = db.window.addToAgent(agentData.id, WindowId());

		assert.equal($store.window[windowData.id], windowData);
		assert.equal(windowData.agentId, agentData.id);
		assert.equal(agentData.windows[0], windowData.id);
	});

	it('should bind correctly.', function () {
		const agentData = db.agent.add();
		const masterData = db.master.add();

		db.bind(masterData.id, agentData.id);

		assert.strictEqual(masterData.agents[agentData.id], true);
		assert.equal(agentData.masterId, masterData.id);
	});
	
	it('should unbind correctly', function () {
		const agentData = db.agent.add();
		const masterData = db.master.add();

		db.bind(masterData.id, agentData.id);

		assert.strictEqual(masterData.agents[agentData.id], true);
		assert.equal(agentData.masterId, masterData.id);

		db.unbind(masterData.id, agentData.id);

		assert.strictEqual(masterData.agents[agentData.id], undefined);
		assert.strictEqual(agentData.masterId, null);
	});

	it('should delete a master correctly.', function () {
		const masterData = db.master.add();
		const deleted = db.master.del(masterData.id);

		assert.strictEqual(deleted, masterData);
		assert.strictEqual($store.master[masterData.id], undefined);
	});

	it('should delete a master with a binding agent correctly.', function () {
		const agentData = db.agent.add();
		const masterData = db.master.add();

		db.bind(masterData.id, agentData.id);

		const deleted = db.master.del(masterData.id);

		assert.strictEqual(deleted, masterData);
		assert.strictEqual(agentData.masterId, null);
		assert.strictEqual($store.master[masterData.id], undefined);
		assert.strictEqual($store.agent[agentData.id], agentData);
	});

	it('should delete a agent correctly', function () {
		const agentData = db.agent.add();
		const masterData = db.master.add();

		db.bind(masterData.id, agentData.id);
		
		const deleted = db.agent.del(agentData.id);

		assert.strictEqual(deleted, agentData);
		assert.strictEqual($store.agent[agentData.id], undefined);
		assert.strictEqual($store.master[masterData.id], masterData);
		assert.strictEqual(masterData.agents[agentData.id], undefined);
	});

	it('should delete a agent with its binding master correctly', function () {
		const agentData = db.agent.add();
		const deleted = db.agent.del(agentData.id);

		assert.strictEqual(deleted, agentData);
		assert.strictEqual($store.agent[agentData.id], undefined);
	});

	it('should delete a window with its agent updating correctly.', function () {
		const agentData = db.agent.add();
		const windowData = db.window.addToAgent(agentData.id, WindowId());
		const deleted = db.window.del(windowData.id);

		assert.equal(agentData.windows.length, 0);
		assert.strictEqual($store.window[windowData.id], undefined);
		assert.strictEqual(deleted, windowData);
	});

	it('should delete a agent with its window correctly.', function () {
		const agentData = db.agent.add();
		const windowData = db.window.addToAgent(agentData.id, WindowId());
		const deleted = db.agent.del(agentData.id);

		assert.strictEqual(deleted, agentData);
		assert.strictEqual($store.window[windowData.id], undefined);
		assert.strictEqual($store.agent[agentData.id], undefined);
	});

	it('should create a program correctly', function () {
		const masterData = db.master.add();
		const agentData = db.agent.add();
		
		db.bind(masterData.id, agentData.id);

		const windowData = db.window.addToAgent(agentData.id, WindowId());

		assert.strictEqual(windowData.program, null);

		const programData = db.program.add({
			hash: '1234',
			name: 'program.test',
			args: [],
			windowId: windowData.id,
			masterId: masterData.id
		});

		assert.strictEqual($store.program[programData.hash], programData);
		assert.deepEqual(masterData.programs, ['1234']);
		assert.strictEqual(windowData.program, '1234');
	});

	it('should delete a program correctly', function () {
		const masterData = db.master.add();
		const agentData = db.agent.add();
		
		db.bind(masterData.id, agentData.id);
		
		const windowData = db.window.addToAgent(agentData.id, WindowId());

		assert.strictEqual(windowData.program, null);

		const programData = db.program.add({
			hash: '1234',
			name: 'program.test',
			args: [],
			windowId: windowData.id,
			masterId: masterData.id
		});

		assert.strictEqual($store.program[programData.hash], programData);

		db.program.del(programData.hash);
		
		assert.strictEqual($store.program[programData.hash], undefined);
	});
});
const assert = require('assert');
const db = require('../src/model/base');

function WindowId() {
	return Math.random().toString(16).substr(2, 8);
}

describe('database::', function () {
	this.afterEach(function () {
		db.$store.master = {};
		db.$store.agent = {};
		db.$store.program = {};
		db.$store.window = {};
	});

	it('should create a master correctly.', function () {
		const masterData = db.master.add();

		assert.equal(db.$store.master[masterData.id], masterData);
	});

	it('should create a agent correctly', function () {
		const agentData = db.agent.add();

		assert.equal(db.$store.agent[agentData.id], agentData);
	});

	it('should create a window to existed agent correctly.', function () {
		const agentData = db.agent.add();
		const windowData = db.window.addToAgent(agentData.id, WindowId());

		assert.equal(db.$store.window[windowData.id], windowData);
		assert.equal(windowData.agentId, agentData.id);
		assert.equal(agentData.windows[0], windowData.id);
	});

	it('should bind correctly.', function () {
		const agentData = db.agent.add();
		const masterData = db.master.add();

		db.bind(masterData.id, 'main', agentData.id);

		assert.equal(masterData.agents['main'], agentData.id);
		assert.equal(agentData.masterId, masterData.id);
	});
	
	it('should unbind correctly', function () {
		const agentData = db.agent.add();
		const masterData = db.master.add();

		db.bind(masterData.id, 'main', agentData.id);

		assert.equal(masterData.agents['main'], agentData.id);
		assert.equal(agentData.masterId, masterData.id);

		db.unbind(masterData.id, 'main');

		assert.strictEqual(masterData.agents['main'], undefined);
		assert.strictEqual(agentData.masterId, null);
	});

	it('should create a program to window by master correctly.', function () {
		const agentData = db.agent.add();
		const windowData = db.window.addToAgent(agentData.id, WindowId());
		const masterData = db.master.add();

		db.bind(masterData.id, 'main', agentData.id);

		const programData = db.program.add(masterData.id, windowData.id, 'main');

		assert.equal(programData.masterId, masterData.id);
		assert.equal(programData.windowId, windowData.id);
		assert.equal(windowData.programId, programData.id);
		assert.strictEqual(masterData.programs[programData.id], true);
	});

	it('should delete a master correctly.', function () {
		const masterData = db.master.add();
		const deleted = db.master.del(masterData.id);

		assert.strictEqual(deleted, masterData);
		assert.strictEqual(db.$store.master[masterData.id], undefined);
	});

	it('should delete a master with a binding agent correctly.', function () {
		const agentData = db.agent.add();
		const masterData = db.master.add();

		db.bind(masterData.id, 'main', agentData.id);

		const deleted = db.master.del(masterData.id);

		assert.strictEqual(deleted, masterData);
		assert.strictEqual(agentData.masterId, null);
		assert.strictEqual(db.$store.master[masterData.id], undefined);
		assert.strictEqual(db.$store.agent[agentData.id], agentData);
	});

	it('should delete a agent correctly', function () {
		const agentData = db.agent.add();
		const masterData = db.master.add();

		db.bind(masterData.id, 'main', agentData.id);
		
		const deleted = db.agent.del(agentData.id);

		assert.strictEqual(deleted, agentData);
		assert.strictEqual(db.$store.agent[agentData.id], undefined);
		assert.strictEqual(db.$store.master[masterData.id], masterData);
		assert.strictEqual(masterData.agents['main'], undefined);
	});

	it('should delete a agent with its binding master correctly', function () {
		const agentData = db.agent.add();
		const deleted = db.agent.del(agentData.id);

		assert.strictEqual(deleted, agentData);
		assert.strictEqual(db.$store.agent[agentData.id], undefined);
	});

	it('should delete a window with its agent updating correctly.', function () {
		const agentData = db.agent.add();
		const windowData = db.window.addToAgent(agentData.id, WindowId());
		const deleted = db.window.del(windowData.id);

		assert.equal(agentData.windows.length, 0);
		assert.strictEqual(db.$store.window[windowData.id], undefined);
		assert.strictEqual(deleted, windowData);
	});

	it('should delete a agent with its window correctly.', function () {
		const agentData = db.agent.add();
		const windowData = db.window.addToAgent(agentData.id, WindowId());
		const deleted = db.agent.del(agentData.id);

		assert.strictEqual(deleted, agentData);
		assert.strictEqual(db.$store.window[windowData.id], undefined);
		assert.strictEqual(db.$store.agent[agentData.id], undefined);
	});

	it('should delete a program correctly', function () {
		const agentData = db.agent.add();
		const windowData = db.window.addToAgent(agentData.id, WindowId());
		const masterData = db.master.add();

		db.bind(masterData.id, 'main', agentData.id);

		const programData = db.program.add(masterData.id, windowData.id, 'main');
		
		db.program.del(programData.id);

		assert.equal(windowData.programId, null);
		assert.strictEqual(masterData.programs[programData.id], undefined);
		assert.strictEqual(masterData.programs[programData.id], undefined);
	});

	it('should delete a agent with its window, a running program and binding master correctly.', function () {
		const agentData = db.agent.add();
		const windowData = db.window.addToAgent(agentData.id, WindowId());
		const masterData = db.master.add();

		db.bind(masterData.id, 'main', agentData.id);

		const programData = db.program.add(masterData.id, windowData.id, 'main');
		const deleted = db.agent.del(agentData.id);

		assert.strictEqual(deleted, agentData);
		assert.strictEqual(db.$store.master[masterData.id], masterData);
		assert.strictEqual(db.$store.program[programData.id], undefined);
		assert.strictEqual(db.$store.window[windowData.id], undefined);
		assert.strictEqual(db.$store.agent[agentData.id], undefined);
		assert.strictEqual(masterData.programs[programData.id], undefined);
	});

	it('should delete a master with its running program and binding agent with window correctly.', function () {
		const agentData = db.agent.add();
		const windowData = db.window.addToAgent(agentData.id, WindowId());
		const masterData = db.master.add();

		db.bind(masterData.id, 'main', agentData.id);

		const programData = db.program.add(masterData.id, windowData.id, 'main');
		const deleted = db.master.del(masterData.id);

		assert.strictEqual(deleted, masterData);
		assert.strictEqual(db.$store.master[masterData.id], undefined);
		assert.strictEqual(db.$store.program[programData.id], undefined);
		assert.strictEqual(db.$store.window[windowData.id], windowData);
		assert.strictEqual(db.$store.agent[agentData.id], agentData);
		assert.strictEqual(agentData.masterId, null);
	});
});
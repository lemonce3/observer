const assert = require('assert');
const db = require('../src/model/base');
const $store = require('../src/model/base/store');

describe('task::', function () {
	it('should destroy master when overtime', function (done) {
		const masterData = db.master.add();

		masterData.visitedAt = masterData.createdAt -= 9000;

		assert.strictEqual($store.master[masterData.id], masterData);

		setTimeout(() => {
			assert.strictEqual($store.master[masterData.id], undefined);

			done();
		}, 2000);
	});

	it('should destroy agent when overtime', function (done) {
		const agentData = db.agent.add();

		agentData.visitedAt = agentData.createdAt -= 59000;

		assert.strictEqual($store.agent[agentData.id], agentData);

		setTimeout(() => {
			assert.strictEqual($store.agent[agentData.id], undefined);

			done();
		}, 2000);
	});

	it('should assign `existedAt` and `error` of program when called overtime.', function (done) {
		const agentData = db.agent.add();
		const windowData = db.window.addToAgent(agentData.id, '472ac0f');
		const masterData = db.master.add();

		db.bind(masterData.id, 'main', agentData.id);

		const programData = db.program.add(masterData.id, windowData.id, 'main');

		programData.timeout = 1000;
		
		assert.strictEqual(db.program.get(programData.id), programData);
		assert.strictEqual(windowData.programId, programData.id);
		
		setTimeout(() => {
			assert.strictEqual(db.program.get(programData.id), programData);
			assert.notStrictEqual(programData.error, null);
			assert.notStrictEqual(programData.exitedAt, null);
			assert.strictEqual(windowData.programId, null);

			setTimeout(() => {
				assert.strictEqual(db.program.get(programData.id), undefined);

				done();
			}, 6000);
		}, 2000);
	});
});
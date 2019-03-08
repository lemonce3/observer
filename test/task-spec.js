const assert = require('assert');
const db = require('../src/model/base');
const $store = require('../src/model/base/store');

describe('task::', function () {
	this.beforeAll(function () {
		$store.master = {};
		$store.agent = {};
		$store.window = {};
	});

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
});
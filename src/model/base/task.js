const store = require('./store');
const agent = require('./schemas/agent');
const master = require('./schemas/master');

const taskList = [];

function watch() {
	const now = Date.now();

	taskList.forEach(task => {
		if (task.last + task.interval < now) {
			task.fn(now);
			task.last = now;
		}
	});
}

function task(name, fn, interval = 1000) {
	taskList.push({ name, fn, interval, last: Date.now() });
}

setInterval(watch, 1000);

task('agent.gc', now => {
	for (let agentId in store.agent) {
		const agentData = store.agent[agentId];

		if (agentData.visitedAt + 60000 < now) {
			agent.del(agentId);
		}
	}
});

task('gc.master', now => {
	for (let masterId in store.master) {
		const masterData = store.master[masterId];

		if (masterData.visitedAt + 10000 < now) {
			master.del(masterId);
		}
	}
});
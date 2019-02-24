const store = require('./store');
const agent = require('./schemas/agent');
const master = require('./schemas/master');
const program = require('./schemas/program');

const taskList = [];

function watch() {
	taskList.forEach(task => {
		task.fn();
	});
}

function task(name, fn) {
	taskList.push({ name, fn });
}

setInterval(watch, 1000);

task('gc.agent', () => {
	for (let agentId in store.agent) {
		const agentData = store.agent[agentId];

		if (agentData.visitedAt + 10000 < Date.now()) {
			agent.del(agentId);
		}
	}
});

task('gc.master', () => {
	for (let masterId in store.master) {
		const masterData = store.master[masterId];

		if (masterData.visitedAt + 10000 < Date.now()) {
			master.del(masterId);
		}
	}
});

task('program.timeout', () => {
	for (let programId in store.program) {
		const programData = store.program[programId];

		if (programData.createdAt + 10000 < Date.now()) {
			program.del(programId);
		}
	}
});
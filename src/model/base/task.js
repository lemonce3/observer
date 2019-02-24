const store = require('./store');
const agent = require('./schemas/agent');
const master = require('./schemas/master');
const program = require('./schemas/program');

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

const PROGRAM_EXIT_FETCH_OVERTIME = 5000;

task('program.timeout', now => {
	for (let programId in store.program) {
		const programData = store.program[programId];

		if (programData.exitedAt === null) {
			const { calledAt, timeout, windowId } = programData;

			if (calledAt + timeout < now) {
				const windowData = store.window[windowId];
				
				windowData.programId = null;
				programData.exitedAt = now;
				programData.error = {
					name: 'observer',
					message: 'The program execution is timeout or no response.'
				};
			}

			return;
		}

		if (programData.exitedAt + PROGRAM_EXIT_FETCH_OVERTIME < now) {
			program.del(programId);
		}
	}
}, 100);
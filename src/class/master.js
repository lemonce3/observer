const sha1 = require('hash.js').sha1;

let count = 0;

class MasterRuntimeError extends Error {}

class Master {
	constructor() {
		this.id = sha1().update(`${Date.now()}-${count++}`).digest('hex');
		this.agent = {};
		this.log = [];
	}

	bind(name, agent) {
		agent.bind(this);
		this.agent[name] = agent;
	}

	unbind(name) {
		if (this.agent === null) {
			throw new MasterRuntimeError('Master has no agent binded.');
		}

		this.agent[name].unbind();
		delete this.agent[name];
	}

	unbindAll() {
		Object.keys(this.agent).forEach(agent => agent.unbind());
		this.agent = {};
	}

	execute(agentName, program, windowQuery = { index: 0 }) {
		const agent = this.agent[agentName];

		program.once('error', (error, program) => {
			console.log('//TODO log');
		});

		program.once('return', (programReturnValue, program) => {

		});

		agent.execute(program, windowQuery);
	}

	pushLog(message, namespace = '*') {
		const newLog = [Date.now(), namespace, message];
		this.log.push(newLog);

		return newLog;
	}

	clearLog() {
		const oldLogList = this.log;

		this.log = [];
		
		return oldLogList;
	}
}

module.exports = {
	Master,
	MasterRuntimeError
};
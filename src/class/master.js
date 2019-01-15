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

	execute(agentName, programId) {

	}
}

module.exports = {
	Master,
	MasterRuntimeError
};
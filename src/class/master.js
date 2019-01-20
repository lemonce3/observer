const sha1 = require('hash.js').sha1;
const EventEmitter = require('events');

let count = 0;

class MasterRuntimeError extends Error {}

class Master extends EventEmitter{
	constructor() {
		super();

		this.id = sha1().update(`${Date.now()}-${count++}`).digest('hex');
		this.agents = {};
		this.log = [];
	}

	bind(name, agent) {
		agent.bind(this);
		this.agents[name] = agent;
		agent.once('destroy', () => this.unbind(name));
	}

	unbind(name) {
		this.agents[name].unbind();
		delete this.agents[name];
	}

	destroy() {
		this.unbindAll();
		this.emit('destroy');
	}

	unbindAll() {
		Object.keys(this.agents).forEach(agent => agent.unbind());
		this.agents = {};
	}

	getAgentByName(name) {
		return this.agents[name];
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
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

	bind(agent) {
		agent.bind(this);
		this.agents[agent.id] = agent;
		agent.once('destroy', () => this.unbind(agent.id));
	}

	unbind(agentId) {
		this.agents[agentId].unbind();
		delete this.agents[agentId];
	}

	destroy() {
		this.unbindAll();
		this.emit('destroy');
	}

	unbindAll() {
		Object.keys(this.agents).forEach(name => {
			this.agents[name].unbind();
		});
		this.agents = {};
	}

	getAgent(id) {
		return this.agents[id];
	}

	pushLog(message, namespace) {
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
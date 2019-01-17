const sha1 = require('hash.js').sha1;

class AgentRuntimeError extends Error {}

class Agent {
	constructor() {
		this.master = null;
		this.id = sha1().update(new Date().toISOString()).digest('hex');

		this.window = {
			list: [],
			idIndex: {},
			nameIndex: {}
		};

		this.master = null;
	}

	queryWindow({ index, name }) {
		if (index) {
			return this.window.list[index];
		}

		if (name) {
			return this.window.mapping[name];
		}

		throw new AgentRuntimeError('Invali query.');
	}

	getWindow(id) {
		return this.window.idIndex[id];
	}

	setWindowName(windowId, name) {
		const window = this.window.nameIndex[name] = this.getWindow(windowId);

		window.setName(name);
	}

	appendWindow(window) {
		this.window.list.push(window);
		this.window.idIndex[window.id] = window;
	}

	removeWindow(id) {
		const window = this.getWindow(id);

		delete this.window.idIndex[id];

		if (window.name) {
			delete this.window.nameIndex[window.name];
		}
	}

	bind(master) {
		this.master = master;
	}

	unbind() {
		this.master = null;
	}

	execute(program, windowQuery = { index: 0 }) {
		this.getWindow(windowQuery).setProgram(program);

		return program;
	}
}

module.exports = {
	Agent,
	AgentRuntimeError
};
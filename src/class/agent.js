const sha1 = require('hash.js').sha1;
const _ = require('lodash');

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

		window.once('destroy', () => this.removeWindow(window.id));
	}

	removeWindow(id) {
		const removed = this.getWindow(id);

		if (!removed) {
			throw new AgentRuntimeError(`Window id:${id} has been removed.`);
		}

		delete this.window.idIndex[id];
		_.remove(this.window.list, window => {
			return 	window === removed;
		});

		if (removed.name) {
			delete this.window.nameIndex[removed.name];
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
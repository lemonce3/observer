const sha1 = require('hash.js').sha1;
const _ = require('lodash');
const EventEmitter = require('events');

class AgentRuntimeError extends Error {}

class Agent extends EventEmitter {
	constructor() {
		super();

		this.id = sha1().update(new Date().toISOString()).digest('hex');
		this.master = null;

		this.windowRegistry = {
			list: [],
			idIndex: {},
		};

		this.onMasterDestroy = () => this.unbind();
	}

	queryWindow(index = 0) {
		return this.windowRegistry.list[index];
	}

	getWindow(id) {
		return this.windowRegistry.idIndex[id];
	}

	appendWindow(window) {
		this.windowRegistry.list.push(window);
		this.windowRegistry.idIndex[window.id] = window;

		window.once('destroy', () => this.removeWindow(window.id));
	}

	removeWindow(id) {
		const removed = this.getWindow(id);

		if (!removed) {
			throw new AgentRuntimeError(`Window id:${id} has been removed.`);
		}

		removed.removeAllListeners('detroy');
		delete this.windowRegistry.idIndex[id];
		_.remove(this.windowRegistry.list, window => window === removed);

		if (removed.name) {
			delete this.windowRegistry.nameIndex[removed.name];
		}
	}

	bind(master) {
		this.master = master;
		master.once('destroy', this.onMasterDestroy);
	}

	unbind() {
		this.master.off('destroy', this.onMasterDestroy);
		this.removeAllListeners('destroy');
		this.master = null;
	}

	destroy() {
		this.emit('destroy', this);
	}
}

module.exports = {
	Agent,
	AgentRuntimeError
};
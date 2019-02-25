const _ = require('lodash');
const db = require('../base');

module.exports = class Master {
	constructor(data) {
		this.data = data;
	}

	visit() {
		this.data.visitedAt = Date.now();

		return this;
	}

	bind(name, agentId) {
		db.bind(this.data.id, name, agentId);

		return this;
	}

	unbind(name) {
		db.unbind(this.data.id, name);

		return this;
	}
	
	execute(windowId, name, args = []) {
		db.program.add(this.id, windowId, name, args);

		return this;
	}

	closeDialog(agentName, windowId, type) {
		const agentData = db.agent.get(this.data.agents[agentName]);
		
		if (agentData.windows.indexOf(windowId) === -1) {
			throw new Error('The specific window is NOT in agent.');
		}

		const windowData = db.window.get(windowId);

		if (windowData.dialog[type] === false) {
			throw new Error(`The window is NOT blocked by ${type} dialog.`);
		}
		
		const dialog = windowData.dialog[type];

		if (dialog === null) {
			throw new Error(`Dialog(type:${type}) is not acitved.`);
		}

		windowData.dialog[type] = null;

		return dialog.ticket;
	}

	destroy() {
		db.master.del(this.id);

		return this;
	}

	static create() {
		return new this(db.master.add());
	}
	
	static select(id) {
		const data = db.agent.get(id);

		return data ? new this(data) : null;
	}
}
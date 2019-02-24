const _ = require('lodash');
const db = require('../base');

const dialog = {
	alert(resolve) {
		resolve();
	},
	confirm({
		resolve
	}, value) {
		if (_.isBoolean(value)) {
			resolve(value);
		}

		throw new Error('Value of a confirm dialog MUST be a boolean.');
	},
	prompt(resolve, value) {
		if (_.isString(value)) {
			resolve(value);
		}

		throw new Error('Value of a prompt dialog MUST be a string.');
	}
};

module.exports = class Master {
	constructor(model) {
		this.model = model;
	}

	get id() {
		return this.model.id;
	}

	visit() {
		this.model.visitedAt = Date.now();
	}

	bind(name, agent) {
		
	}

	unbind(name) {
		const agentModel = this.model.agents[name];
	}
	
	execute(windowId, name, args = []) {
		db.program.add(this.id, windowId, name, args);
	}

	closeDialog(agentName, windowId, {
		type, returnValue, resolve
	}) {
		const agentData = db.agent.get( this.model.agents[agentName]);
		
		if (agentData.windows.indexOf(windowId) === -1) {
			throw new Error('There is not a specific window in agent.');
		}

		const windowData = db.window.get(windowId);

		if (windowData.dialog[type] === false) {
			throw new Error(`The window is NOT blocked by ${type} dialog.`);
		}
		
		dialog[type](returnValue, resolve);
	}

	destroy() {
		db.master.del(this.id);
	}

	static create() {

	}
	
	static select(id) {
		const model = db.agent.get(id);

		if (!model) {
			throw new Error('Master is NOT existed.');
		}

		return new this(model);
	}
}
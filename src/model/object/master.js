const db = require('../base');

module.exports = class Master {
	constructor(id) {
		this.model = db.agent.get(id);
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

	resovleDialog(agentName, windowId, dialogType) {

	}

	destroy() {
		db.master.del(this.id);
	}

	static create() {

	}
	
	static select(id) {

	}
}
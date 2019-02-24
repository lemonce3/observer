const db = require('../base');

module.exports = class Agent {
	constructor(id) {
		this.model = db.agent.get(id);
	}

	get id() {
		return this.model.id;
	}

	visit() {
		this.model.visitedAt = Date.now();
	}

	appendWindow() {

	}

	removeWindow() {

	}

	exit(windowId, programId, error, returnValue) {

	}

	destroy() {
		db.agent.del(this.id);
	}
	
	static create() {

	}

	static select(id) {

	}
}
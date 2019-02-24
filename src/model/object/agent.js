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

	openDialogByWindow(windowId, {
		type, message, timeout
	}) {

	}

	exitProgram(windowId, programId, error, returnValue) {
		if (!this.model.windows[windowId]) {
			throw new Error('The window is NOT found in agent.');
		}

		const programData = db.program.get(programId);

		if (!programData) {
			new Error('Program is NOT found.');
		}

		const windowData = db.window.get(windowId);

		if (windowData.programData !== programData) {
			new Error('The program dose NOT belongs to the window.');
		}


	}

	destroy() {
		db.agent.del(this.id);
	}
	
	static create() {

	}

	static selectById(id) {

	}

	static selectOneIdle() {

	}
}
const db = require('../base');

module.exports = class Window {
	constructor(data) {
		this.data = data;
	}

	get model() {

	}

	visit() {
		this.data.visitedAt = Date.now();

		return this;
	}
	
	callProgram(name, args = []) {
		db.program.add(this.id, this.data.id, name, args);

		return this;
	}

	exitProgram(programId, error, returnValue) {
		const programData = db.program.get(programId);

		programData.exitedAt = Date.now();

		if (error !== null) {
			programData.error = {
				name: 'agent',
				message: error
			};
		} else {
			programData.returnValue = returnValue;
		}

		this.data.programId = null;
		programData.windowId = null;

		return this;
	}

	openDialogByWindow(type, message, ticket) {
		this.data.dialog[type] = { ticket, message };

		return ticket;
	}

	closeDialog(type) {
		const dialog = this.data.dialog[type];

		if (this.data.dialog[type] === null) {
			throw new Error(`Dialog(type:${type}) is not acitved.`);
		}

		this.data.dialog[type] = null;

		return dialog.ticket;
	}
	
	update({ meta, rect }) {
		Object.assign(this.data.meta, {
			title: String(meta.title),
			URL: String(meta.title),
			referrer: String(meta.title),
			domain: String(meta.title)
		});

		Object.assign(this.data.rect, {
			width: parseInt(rect.width),
			height: parseInt(rect.height),
			top: parseInt(rect.top),
			left: parseInt(rect.left)
		});

		return this;
	}

	destroy() {
		db.window.del(this.data.id);

		return this;
	}

	static create(agentId) {
		return new this(db.window.addToAgent(agentId));
	}

	static select(id) {
		const data = db.window.get(id);

		return data ? new this(data) : null;
	}
};
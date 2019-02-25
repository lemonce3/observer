const db = require('../base');

module.exports = class Agent {
	constructor(data) {
		this.data = data;
	}

	get model() {

	}

	visit() {
		this.data.visitedAt = Date.now();

		return this;
	}

	update({ origin, modifier, pointer }) {
		this.data.origin = origin;
		
		Object.assign(this.data.modifier, {
			ctrl: Boolean(modifier.ctrl),
			shift: Boolean(modifier.shift),
			alt: Boolean(modifier.alt),
			meta: Boolean(modifier.meta)
		});

		Object.assign(this.data.pointer, {
			x: Number(pointer.x),
			y: Number(pointer.y)
		});
	}

	appendWindow(id) {
		db.window.addToAgent(this.data.id, id);

		return this;
	}

	updateWindow(id, { meta, rect }) {
		const windowData = db.window.get(id);

		if (this.data.windows.indexOf(windowData.id) === -1) {
			throw new Error('The window NOT belongs to this agent.');
		}

		Object.assign(windowData.meta, {
			title: String(meta.title)
		});

		Object.assign(windowData.rect, {
			width: parseInt(rect.width),
			height: parseInt(rect.height),
			top: parseInt(rect.top),
			left: parseInt(rect.left)
		});

		return this;
	}

	removeWindow(id) {
		db.window.del(id);

		return this;
	}

	openDialogByWindow(windowId, type, message) {
		const windowData = db.window.get(windowId);

		if (this.data.id !== windowData.agentId) {
			throw new Error('Window not in this agent.');
		}

		const ticket = Math.random().toString(16).substr(2, 8);

		windowData.dialog[type] = { ticket, message };

		return ticket;
	}

	exitProgram(windowId, programId, error, returnValue) {
		if (!this.data.windows[windowId]) {
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

		programData.exitedAt = Date.now();

		if (error !== null) {
			programData.error = {
				name: 'agent',
				message: error
			};
		} else {
			programData.returnValue = returnValue;
		}

		windowData.programId = null;
		programData.windowId = null;

		return this;
	}

	destroy() {
		db.agent.del(this.data.id);

		return this;
	}
	
	static create() {
		return new this(db.agent.add());
	}

	static selectById(id) {
		const data = db.agent.get(id);

		return data ? new this(data) : null;
	}

	static selectOneIdle(options = {}) {
		const now = Date.now();

		const data = Object.keys(db.$store.agent).find(data => {
			if (data.visitedAt + 100000 < now) {
				return false;
			}

			if (data.masterId !== null) {
				return false;
			}

			if (options.origin && options.origin !== data.origin) {
				return false;
			}

			return true;
		});

		return data ? new this(data) : null;
	}
}
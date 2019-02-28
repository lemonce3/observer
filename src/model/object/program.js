const db = require('../base');

module.exports = class Window {
	constructor(data) {
		this.data = data;
	}

	exit(error, returnValue) {
		this.data.exitedAt = Date.now();

		if (error !== null) {
			this.data.error = { name: 'agent', message: error };
		} else {
			this.data.returnValue = returnValue;
		}

		this.data.programId = null;
		this.data.windowId = null;

		return this;
	}

	destroy() {
		db.program.del(this.data.id);

		return this;
	}

	static create({ masterId, windowId, name, args }) {
		return new this(db.program.add(masterId, windowId, name, args));
	}

	static select(id) {
		const data = db.program.get(id);

		return data ? new this(data) : null;
	}
};
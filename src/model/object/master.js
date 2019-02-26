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

	destroy() {
		db.master.del(this.id);

		return this;
	}

	static create() {
		return new this(db.master.add());
	}
	
	static select(id) {
		const data = db.master.get(id);

		return data ? new this(data) : null;
	}
};
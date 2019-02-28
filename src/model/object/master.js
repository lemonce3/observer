const db = require('../base');

module.exports = class Master {
	constructor(data) {
		this.data = data;
	}

	get model() {
		return this;
	}

	visit() {
		this.data.visitedAt = Date.now();

		return this;
	}

	bind(agentId) {
		db.bind(this.data.id, agentId);

		return this;
	}

	unbind(name) {
		db.unbind(this.data.id, name);

		return this;
	}

	destroy() {
		db.master.del(this.data.id);

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
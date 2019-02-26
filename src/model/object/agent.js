const db = require('../base');
const $store = require('../base/store');

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

	update({ modifier, pointer }) {
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

	static selectAll() {
		return Object.keys($store.agent).map(id => $store.agent[id]);
	}
};
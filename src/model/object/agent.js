const db = require('../base');
const $store = require('../base/store');

module.exports = class Agent {
	constructor(data) {
		this.data = data;
	}

	visit() {
		this.data.visitedAt = Date.now();

		return this;
	}

	allocateWindow(doc) {
		const lastWindow = this.data.lastWindow;

		if (lastWindow) {
			if (!doc) {
				lastWindow.doc++;
			}

			this.data.lastWindow = null;

			return lastWindow;
		}

		return {
			id: Math.random().toString(16).substr(2, 8),
			doc: 1
		};
	}

	freeWindow(id, doc) {
		return this.data.lastWindow = {
			id, doc
		};
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
	
	static create(ua) {
		return new this(db.agent.add(ua));
	}

	static selectById(id) {
		const data = db.agent.get(id);

		return data ? new this(data) : null;
	}

	static selectAll() {
		return Object.keys($store.agent).map(id => $store.agent[id]);
	}
};
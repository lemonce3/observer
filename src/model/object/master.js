const db = require('../base');
const _ = require('lodash');

const localKeys = ['id', 'createdAt', 'visitedAt', 'agents', 'programs'];
const agentKeys = ['id', 'createdAt', 'visitedAt', 'modifier', 'pointer'];
const programKeys = ['hash', 'name', 'args', 'error', 'returnValue', 'isExited'];
const windowKeys = ['id', 'createdAt', 'visitedAt', 'meta', 'rect', 'dialog', 'program'];

module.exports = class Master {
	constructor(data) {
		this.data = data;
	}

	get model() {
		const local = Object.assign(_.pick(this.data, localKeys), {
			agents: {},
		});

		Object.keys(this.data.agents).forEach(agentId => {
			const agentData = db.agent.get(agentId);
			const agent = local.agents[agentId] = _.pick(agentData, agentKeys);

			agent.windows = agentData.windows.map(windowId => {
				const window = _.pick(db.window.get(windowId), windowKeys);

				window.program = _.pick(window.program, programKeys);

				return window;
			});
		});

		return local;
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
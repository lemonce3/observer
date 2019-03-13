const db = require('../base');
const _ = require('lodash');

const localKeys = ['id', 'agents', 'programs'];
const agentKeys = ['id', 'modifier', 'pointer', 'ua'];
const programKeys = ['hash', 'name', 'args', 'error', 'returnValue', 'windowId'];
const windowKeys = ['id', 'meta', 'rect', 'dialog', 'program'];

module.exports = class Master {
	constructor(data) {
		this.data = data;
	}

	get model() {
		const local = Object.assign(_.pick(this.data, localKeys), {
			agents: {},
			programs: {}
		});

		Object.keys(this.data.agents).forEach(agentId => {
			const agentData = db.agent.get(agentId);
			const agent = local.agents[agentId] = _.pick(agentData, agentKeys);

			agent.windows = agentData.windows.map(windowId => _.pick(db.window.get(windowId), windowKeys));
		});

		this.data.programs.forEach(hash => {
			const programData = db.program.get(hash);
			const model = _.pick(programData, programKeys);

			model.isExited = programData.exitedAt !== null;

			local.programs[hash] = model;
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

	deleteProgram(hash) {
		_.pull(this.data.programs, hash);
		db.program.del(hash);
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
const db = require('../base');
const _ = require('lodash');

const localKeys = ['id', 'createdAt', 'visitedAt', 'meta', 'rect'];
const programKeys = ['id', 'name', 'args', 'error', 'returnValue'];
const agentKeys = ['id', 'createdAt', 'visitedAt', 'masterId', 'modifier', 'pointer', 'ua'];

module.exports = class Window {
	constructor(data) {
		this.data = data;
	}

	get model() {
		const local = _.pick(this.data, localKeys);
		const programId = this.data.programId;

		let program = null;

		if (programId) {
			const programData = db.program.get(programId);
			
			program = _.pick(programData, programKeys);
			program.isExited = Boolean(programData.exitedAt);
		}

		const agent = _.pick(db.agent.get(this.data.agentId), agentKeys);

		local.program = program;
		local.agent = agent;

		return local;
	}

	visit() {
		this.data.visitedAt = Date.now();

		return this;
	}

	openDialog(type, message, ticket) {
		this.data.dialog[type] = { ticket, message };

		return this;
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
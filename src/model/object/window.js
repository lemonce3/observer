const db = require('../base');
const _ = require('lodash');

const localKeys = ['id', 'createdAt', 'visitedAt', 'meta', 'rect'];
const programKeys = ['hash', 'name', 'args', 'error', 'returnValue', 'isExited'];
const agentKeys = ['id', 'createdAt', 'visitedAt', 'masterId', 'modifier', 'pointer', 'ua'];

module.exports = class Window {
	constructor(data) {
		this.data = data;
		this.programWatcher = null;
	}

	get model() {
		const local = _.pick(this.data, localKeys);

		local.program = _.pick(this.data.program, programKeys);
		local.agent = _.pick(db.agent.get(this.data.agentId), agentKeys);

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

	callProgram(hash, name, args = [], timeout = 10000) {
		if (!this.data.program.isExited) {
			throw new Error('Window is busy with program.');
		}

		const program = this.data.program = {
			hash,
			name,
			args,
			
			isExited: false,
			returnValue: undefined,
			error: null,
	
			timeout
		};

		this.programWatcher = setTimeout(() => {
			program.isExited = true;
			program.error = {
				name: 'observer',
				message: 'The program execution is timeout or no response.'
			};
		}, timeout);

		return this;
	}

	exitProgram(error, returnValue) {
		if (this.data.program.isExited) {
			throw new Error('No program is invoking.');
		}

		clearTimeout(this.programWatcher);
		this.programWatcher = null;

		const program = this.data.program;

		program.isExited = true;

		if (error !== null) {
			program.error = { name: 'agent', message: error };
		} else {
			program.returnValue = returnValue;
		}

		return this;
	}
	
	update({ meta, rect }) {
		Object.assign(this.data.meta, {
			title: meta.title,
			URL: meta.URL,
			referrer: meta.referrer,
			domain: meta.domain
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
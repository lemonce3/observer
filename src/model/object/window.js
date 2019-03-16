const db = require('../base');
const _ = require('lodash');

const localKeys = ['id', 'meta', 'rect', 'upload'];
const programKeys = ['hash', 'name', 'args', 'error', 'returnValue'];
const agentKeys = ['id', 'masterId', 'modifier', 'pointer'];

module.exports = class Window {
	constructor(data) {
		this.data = data;
	}

	get model() {
		const local = _.pick(this.data, localKeys);
		const programHash = this.data.program;

		local.program = programHash && _.pick(db.program.get(programHash), programKeys);
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
		// if (this.data.program) {
		// 	throw new Error('Window is busy with program.');
		// }

		if (this.data.upload.pending === true) {
			throw new Error('The window MUST be resovled upload first.');
		}

		const programData = db.program.add({
			hash, name, args,
			windowId: this.data.id,
			masterId: db.agent.get(this.data.agentId).masterId
		});

		this.data.program = hash;

		this.programWatcher = setTimeout(() => {
			this.data.program = null;
			programData.exitedAt = Date.now();
			programData.error = {
				name: 'observer',
				message: 'The program execution is timeout or no response.'
			};
		}, timeout);

		return this;
	}

	exitProgram(error, returnValue) {
		if (!this.data.program) {
			throw new Error('No program is invoking.');
		}

		clearTimeout(this.programWatcher);
		this.programWatcher = null;

		const programData = db.program.get(this.data.program);

		programData.exitedAt = Date.now();

		if (error !== null) {
			programData.error = { name: 'agent', message: error };
		} else {
			programData.returnValue = returnValue;
		}

		this.data.program = null;

		return this;
	}

	upload(fileList = []) {
		if (this.data.upload.pending !== true) {
			throw new Error('The window is NOT waiting upload.');
		}

		this.data.upload.fileList = fileList;
	}
	
	update({ meta, rect, upload }) {
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

		this.data.upload.pending = upload.pending;

		if (upload.pending === false) {
			this.upload.fileList = [];
		}

		return this;
	}

	destroy() {
		db.window.del(this.data.id);

		return this;
	}

	static create(agentId, id, meta, rect) {
		return new this(db.window.addToAgent(agentId, id, meta, rect));
	}

	static select(id) {
		const data = db.window.get(id);

		return data ? new this(data) : null;
	}
};
const sha1 = require('hash.js').sha1;
const EventEmitter = require('events');

const IDLE_GC_TIMEOUT = 15000;

class AgentRuntimeError extends Error {}
class WindowRuntimeError extends Error {}

let count = 0;

class Window extends EventEmitter {
	constructor() {
		super();

		this.id = sha1().update(`${Date.now()}-${count++}`).digest('hex');
		this.name = null;
		this.program = null;
		this.pointer = { x: 0, y: 0 };
		this.lastVisited = Date.now();

		process.on('app-gc', now => {
			if (this.lastVisited + IDLE_GC_TIMEOUT < now) {
				this.destroy();
			}
		});
	}
	
	setProgram(program) {
		if (this.program !== null) {
			throw new WindowRuntimeError('The window is busy.');
		}

		this.program = program;

		program.on('return', () => this.resetProgram());
		program.on('error', () => this.resetProgram());

		this.visit();
	}

	resetProgram() {
		this.program = null;

		this.visit();
	}

	setName(name) {
		if (this.name === null) {
			this.name = name;
		}

		throw new WindowRuntimeError('Window could not be set name one more time.');
	}

	visit() {
		this.lastVisited = Date.now();
	}

	destroy() {
		this.emit('destroy');
	}
}

class Agent {
	constructor(id) {
		this.master = null;
		this.id = id;

		this.window = {
			list: [],
			idIndex: {},
			nameIndex: {}
		};

		this.master = null;
	}

	queryWindow({ index, name }) {
		if (index) {
			return this.window.list[index];
		}

		if (name) {
			return this.window.mapping[name];
		}

		throw new AgentRuntimeError('Invali query.');
	}

	getWindow(id) {
		return this.window.idIndex[id];
	}

	setWindowName(windowId, name) {
		const window = this.window.nameIndex[name] = this.getWindow(windowId);

		window.setName(name);
	}

	appendWindow(window) {
		this.window.list.push(window);
		this.window.idIndex[window.id] = window;
	}

	removeWindow(id) {
		const window = this.getWindow(id);

		delete this.window.idIndex[id];

		if (window.name) {
			delete this.window.nameIndex[window.name];
		}
	}

	bind(master) {
		this.master = master;
	}

	unbind() {
		this.master = null;
	}

	execute(program, windowQuery = { index: 0 }) {
		this.getWindow(windowQuery).setProgram(program);

		return program;
	}
}

module.exports = {
	Agent,
	Window,
	AgentRuntimeError,
	WindowRuntimeError
};
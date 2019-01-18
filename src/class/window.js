const sha1 = require('hash.js').sha1;
const EventEmitter = require('events');

const IDLE_GC_TIMEOUT = 10000;

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

		this.destroyWrap = now => {
			if (this.lastVisited + IDLE_GC_TIMEOUT < now) {
				this.destroy();
			}
		};

		process.on('app-gc', this.destroyWrap);
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
		process.off('app-gc', this.destroyWrap);
	}
};

module.exports = {
	Window,
	WindowRuntimeError
};
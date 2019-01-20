const sha1 = require('hash.js').sha1;
const EventEmitter = require('events');

class WindowRuntimeError extends Error {}

let count = 0;

class Window extends EventEmitter {
	constructor() {
		super();

		this.id = sha1().update(`${Date.now()}-${count++}`).digest('hex');
		this.program = null;
		this.pointer = { x: 0, y: 0 };
		this.meta = {};
	}
	
	execute(program) {
		if (this.program !== null) {
			throw new WindowRuntimeError('The window is busy.');
		}

		this.program = program;

		program.once('exit', () => this.resetProgram());
	}

	resetProgram() {
		this.program = null;
	}

	destroy() {
		this.emit('destroy');
		//TODO program timeout by agent life-cyele.
	}
};

module.exports = {
	Window,
	WindowRuntimeError
};
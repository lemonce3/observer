const DEFERRED = 30 * 1000;

class AgentRuntimeError extends Error {}
class WindowRuntimeError extends Error {}

class Window {
	constructor() {
		this.name	= null;
		this.program = null;
	}
	
	get isBusy() {
		return this.program !== null;
	}

	putProgram(program, timeout = 3000) {
		if (isBusy) {
			throw new WindowRuntimeError('The window is busy.');
		}

		this.program = program;

		program.on('return', () => this.program = null);
		setTimeout(() => this.program = null, timeout);
	}

	setName(name) {
		return this.name = name;
	}
}

class Agent {
	constructor() {
		this.master = null;
		this.id = null;
		this.lastRequestTime = Date.now();

		this.window = {
			focus: null,
			list: []
		};

		this.master = null;
	}

	get isActive() {
		return Date.now() > this.lastRequestTime + DEFERRED;
	}

	fetch() {
		this.lastRequestTime = Date.now();

		return this.programQueue.shift() || null;
	}

	push(program, window = this.window[0]) {
		if (!this.isActive) {
			throw new AgentRuntimeError(`The agent id:${this.id} is inactive.`);
		}

		if (!window) {
			throw new AgentRuntimeError('No active window for this agent');
		}

		this.window.programQueue(program);

		return program;
	}

	bind(master) {
		this.master = master;
	}

	unbind() {
		this.master = null;
	}
}

module.exports = {
	Agent,
	Window,
	AgentRuntimeError
};
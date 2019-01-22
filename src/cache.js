const LRU = require('lru-cache');
const { Master } = require('./class/master');
const { Agent } = require('./class/agent');
const { Window } = require('./class/window');
const { Program, ProgramError, ProgramReturnValue } = require('./class/program');
const SECOND = 1000;

module.exports = {
	program: new LRU({
		maxAge: 10 * SECOND,
		dispose(id, program) {
			if (!program.isExited) {
				program.setError(new ProgramError('ProgramRuntime', 'timeout', []));
			}
		}
	}),
	master: new LRU({
		maxAge: 10 * SECOND,
		updateAgeOnGet: true,
		dispose(id, master) {
			master.destroy();
		}
	}),
	agent: new LRU({
		maxAge: 10 * SECOND,
		updateAgeOnGet: true,
		dispose(id, agent) {
			agent.destroy();
		}
	}),
	window: new LRU({
		maxAge: 10 * SECOND,
		updateAgeOnGet: true,
		dispose(id, window) {
			window.destroy();
		}
	}),
	getIdleAgent() {
		this.agent.prune();
		
		return this.agent.values().find(agent => agent.master === null);
	},
	createMaster() {
		const master = new Master();
		this.master.set(master.id, master);
		
		return this.getMaster(master.id);
	},
	createAgent() {
		const agent = new Agent();
		this.agent.set(agent.id, agent);

		return this.getAgent(agent.id);
	},
	createWindow(agentId, options) {
		const agent = this.agent.peek(agentId);
		const window = new Window(options);
		
		this.window.set(window.id, window);
		agent.appendWindow(window);

		return this.getWindow(window.id);
	},
	createProgram(agentId, windowId, { name, args = [], timeout = 0 }) {
		const agent = this.agent.peek(agentId);
		const window = this.window.peek(windowId);

		if (!agent || !window) {
			throw new Error('');
		}

		if (agent.getWindow(windowId) !== window) {
			throw new Error('');
		}

		const program = new Program(name, args);
		this.program.set(program.id, program, timeout);

		window.execute(program);

		return this.getProgram(program.id);
	},
	exitProgram(id, {
		error = null,
		returnValue = { isObject: false, value: undefined }
	}) {
		const program = this.program.peek(id);

		if (error) {
			const { type, message, stack = [] } = error;
			program.setError(new ProgramError(type, message, stack));
		} else if (returnValue) {
			const { isObject, value } = returnValue;
			program.setReturnValue(new ProgramReturnValue(value, isObject));
		} else {
			throw new Error('');
		}
	},
	getMaster(id) {
		const master = this.master.get(id);

		return master && ModelMaster(master);
	},
	getAgent(id) {
		const agent = this.agent.get(id);

		return agent && ModelAgent(agent);
	},
	getWindow(id) {
		const window = this.window.get(id);

		return window && ModelWindow(window);
	},
	getProgram(id) {
		const program = this.program.get(id);

		return program && ModelProgram(program);
	},
	getAllWindow() {
		this.window.prune();
		return this.window.values().map(window => ModelWindow(window));
	},
	getAllMaster() {
		this.master.prune();
		return this.master.values().map(master => ModelMaster(master));
	},
	getAllAgent() {
		this.agent.prune();
		return this.agent.values().map(agent => ModelAgent(agent));
	},
	getAllProgram() {
		this.program.prune();
		return this.program.values().map(program => ModelProgram(program));
	},
	ModelAgent,
	ModelMaster,
	ModelProgram,
	ModelWindow,
};

function ModelProgram(program) {
	return {
		id: program.id,
		name: program.name,
		args: program.args,
		returnValue: program.returnValue,
		error: program.error
	};
}

function ModelMaster(master) {
	return {
		id: master.id,
		agents: Object.keys(master.agents)
	};
}

function ModelAgent(agent) {
	return {
		id: agent.id,
		master: agent.master && agent.master.id,
	};
}

function ModelWindow(window) {
	return {
		id: window.id,
		program: window.program && {
			name: window.program.name,
			args: window.program.args
		},
		pointer: window.pointer,
		meta: window.meta
	};
}

function ModelMasterLog() {

}
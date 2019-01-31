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
		this.master.prune();
		
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
		returnValue
	}) {
		const program = this.program.peek(id);

		if (error) {
			const { type, message, stack = [] } = error;
			program.setError(new ProgramError(type, message, stack));
		} else {
			program.setReturnValue(new ProgramReturnValue(returnValue));
		}
	},
	getMaster(id) {
		const master = this.master.get(id);
		
		this.agent.prune();
		this.window.prune();

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
		this.agent.prune();
		this.master.prune();
		return this.master.values().map(master => ModelMaster(master));
	},
	getAllAgent() {
		this.agent.prune();
		this.master.prune();
		this.window.prune();
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
		returnValue: program.returnValue && program.returnValue.value,
		error: program.error
	};
}

function ModelMaster(master) {
	const agents = {};

	for(const id in master.agents) {
		agents[id] = ModelAgent(master.agents[id]);
	}

	return {
		id: master.id,
		agents
	};
}

function ModelAgent(agent) {
	return {
		id: agent.id,
		master: agent.master && agent.master.id,
		windows: agent.windowRegistry.list.map(window => ModelWindow(window))
	};
}

function ModelWindow(window) {
	return {
		id: window.id,
		program: window.program && {
			id: window.program.id,
			name: window.program.name,
			args: window.program.args
		},
		pointer: window.pointer,
		meta: window.meta
	};
}

function ModelMasterLog() {

}
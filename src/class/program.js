const EventEmitter = require('events');
const sha1 = require('hash.js').sha1;

let count = 0;

class Program extends EventEmitter {
	constructor(name, args = [], timout = 3000) {
		super();

		this.id = sha1().update(`${Date.now()}-${count++}`).digest('hex');

		this.name = name;
		this.args = args;

		this.returnValue = null;
		this.error = null;

		setTimeout(() => this.setError(), timout);
	}

	get isPending() {
		return this.returnValue === null && this.error === null;
	}

	setReturn(returnValue) {
		this.emit('return', this.returnValue = returnValue, this);
	}

	setError(error) {
		this.emit('error', this.error = error, this);
	}
}

class ProgramReturnValue {
	constructor(value, isObject) {
		this.isObject = isObject;
		this.value = value;
	}
}

class ProgramError {
	constructor(type, message, stack) {
		this.type = type;
		this.message = message;
		this.stack = stack;
	}
}

module.exports = {
	Program,
	ProgramReturnValue,
	ProgramError
};
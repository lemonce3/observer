const EventEmitter = require('events');
const sha1 = require('hash.js').sha1;

let count = 0;

class Program extends EventEmitter {
	constructor(name, args = []) {
		super();

		this.id = sha1().update(`${Date.now()}-${count++}`).digest('hex');

		this.name = name;
		this.args = args;

		this.returnValue = null;
		this.error = null;
	}

	get isPending() {
		return this.returnValue === null && this.error === null;
	}

	get isExited() {
		return this.returnValue !== null || this.error !== null;
	}

	setReturnValue(returnValue) {
		this.returnValue = returnValue;
		this.$exit();
	}

	setError(error) {
		this.error = error;
		this.$exit();
	}

	$exit() {
		this.emit('exit', this);
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
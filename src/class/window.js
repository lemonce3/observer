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

		this.dialog = {
			alert: null,
			confirm: null,
			prompt: null
		};
	}
	
	execute(program) {
		const { alert, confirm, prompt } = this.dialog;

		if (this.program || alert || confirm || prompt) {
			throw new WindowRuntimeError('The window is busy.');
		}

		this.program = program;

		program.once('exit', () => this.resetProgram());
	}

	setDialog(type, message) {
		return new Promise((resolve, reject) => {
			const dialog = new dialogMapping[type](message, resolve);

			setTimeout(() => {
				dialog.removeAllListeners('resolve');
				this.dialog[type] = null;
				reject('Dialog timeout.');
			}, 8000);

			dialog.once('resolve', () => this.dialog[type] = null);
			this.dialog[type] = dialog;
		});
	}

	getDialog(type) {
		return this.dialog[type];
	}

	resetProgram() {
		this.program = null;
	}

	destroy() {
		this.emit('destroy');
	}
}

class Dialog extends EventEmitter {
	constructor(message, resolve) {
		super();

		this.message = message;
		this.$resolve = resolve;
	}

	resolve(value) {
		this.$resolve(value);
		this.emit('resolve');
	}
}

class AlertDialog extends Dialog {
	ok() {
		this.resolve();
	}
}

class ConfirmDialog extends Dialog {
	ok() {
		this.resolve(true);
	}

	cancel() {
		this.resolve(false);
	}
}

class PromptDialog extends Dialog {
	input(value) {
		this.resolve(String(value));
	}
}

const dialogMapping = {
	alert: AlertDialog,
	confirm: ConfirmDialog,
	prompt: PromptDialog
};

module.exports = {
	AlertDialog,
	ConfirmDialog,
	PromptDialog,
	Window,
	WindowRuntimeError
};
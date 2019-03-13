const EventEmitter = require('events');

module.exports = Object.assign(new EventEmitter(), {
	master: {},
	agent: {},
	window: {},
	program: {}
});
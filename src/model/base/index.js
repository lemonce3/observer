const store = exports.$store = require('./store');
exports.agent = require('./schemas/agent');
exports.master = require('./schemas/master');
exports.program = require('./schemas/program');
exports.window = require('./schemas/window');

exports.bind = function (masterId, name, agentId) {
	const masterData = store.master[masterId];
	const agentData = store.agent[agentId];

	masterData.agents[name] = agentData.id;
	agentData.masterId = masterId;
};

exports.unbind = function (masterId, name) {
	const masterData = store.master[masterId];
	const agentId = masterData.agents[name];
	const agentData = store.agent[agentId];

	agentData.masterId = null;
	delete masterData.agents[name];
};

require('./task');
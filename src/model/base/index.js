const store = require('./store');

exports.agent = require('./schemas/agent');
exports.master = require('./schemas/master');
exports.window = require('./schemas/window');
exports.program = require('./schemas/program');

exports.bind = function (masterId, agentId) {
	const masterData = store.master[masterId];
	const agentData = store.agent[agentId];

	masterData.agents[agentData.id] = true;
	agentData.masterId = masterId;
};

exports.unbind = function (masterId, agentId) {
	const masterData = store.master[masterId];
	const agentData = store.agent[agentId];

	agentData.masterId = null;
	delete masterData.agents[agentId];
};

require('./task');
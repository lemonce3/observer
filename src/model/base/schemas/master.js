const store = require('../store');

let counter = 1;

exports.add = function () {
	const id = counter++;
	const now = Date.now();

	return store.master[id] = {
		id: id,
		createdAt: now,
		visitedAt: now,
		programs: [],
		agents: {},
	};
};

exports.get = function (id) {
	return store.master[id];
};

exports.del = function (id) {
	const masterData = store.master[id];

	delete store.master[id];
	store.emit('master-delete', masterData);
	
	return masterData;
};

store.on('agent-delete', agentData => {
	if (agentData.masterId !== null) {
		const masterData = store.master[agentData.masterId];
		delete masterData.agents[agentData.id];
	}
});
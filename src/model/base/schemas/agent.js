const store = require('../store');

let counter = 1;

exports.add = function (ua = null) {
	const id = counter++;
	const now = Date.now();

	return store.agent[id] = {
		id,
		ua,
		createdAt: now,
		visitedAt: now,
		masterId: null,
		modifier: {
			ctrl: false,
			shift: false,
			alt: false,
			meta: false
		},
		pointer: {
			x: 0,
			y: 0
		},
		windows: []
	};
};

exports.get = function (id) {
	return store.agent[id];
};

exports.del = function (id) {
	const agentData = store.agent[id];

	delete store.agent[id];
	store.emit('agent-delete', agentData);

	return agentData;
};

store.on('window-delete', windowData => {
	const agentData = store.agent[windowData.agentId];

	if (agentData) {
		const index = agentData.windows.indexOf(windowData.id);
		agentData.windows.splice(index, 1);
	}
});

store.on('master-delete', masterData => {
	for (let agentId in masterData.agents) {
		const agentData = store.agent[agentId];

		agentData.masterId = null;
	}
});
const _ = require('lodash');
const store = require('../store');

exports.addToAgent = function (agentId) {
	if (!_.isNumber(agentId)) {
		throw new Error('AgentId MUST be a number.');
	}

	const windowId = Math.random().toString(16).substr(2, 8);
	const now = Date.now();
	const agentData = store.agent[agentId];
	const windowData = store.window[windowId] = {
		id: windowId,
		agentId,
		createdAt: now,
		visitedAt: now,
		program: null,
		meta: { title: null, URL: null, referrer: null, domain: null },
		rect: { width: 0, height: 0, top: 0, left: 0 }, //TODO screen
		dialog: { alert: null, confirm: null, prompt: null },
		upload: {
			pending: false,
			fileList: [] //TODO null
		}
	};

	agentData.windows.push(windowId);
	
	return windowData;
};

exports.get = function (id) {
	return store.window[id];
};

function deleteWindow (id) {
	const windowData = store.window[id];

	delete store.window[id];
	store.emit('window-delete', windowData);

	return windowData;
}

store.on('agent-delete', agentData => {
	agentData.windows.forEach(windowId => deleteWindow(windowId));
});

exports.del = deleteWindow;
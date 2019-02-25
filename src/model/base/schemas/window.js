const _ = require('lodash');
const store = require('../store');

exports.addToAgent = function (agentId, windowId) {
	if (!_.isNumber(agentId)) {
		throw new Error('AgentId MUST be a number.');
	}

	if (!_.isString(windowId)) {
		throw new Error('Window id MUST be a string.');
	}

	const agentData = store.agent[agentId];
	const windowData = store.window[windowId] = {
		id: windowId,
		agentId,
		createdAt: Date.now(),
		programId: null,
		meta: {
			title: null,
		},
		rect: {
			width: 0,
			height: 0,
			top: 0,
			left: 0
		},
		dialog: {
			alert: null,
			confirm: null,
			prompt: null
		}
	};

	agentData.windows.push(windowId);
	
	return windowData;
};

exports.get = function (id) {
	return store.window[id];
};

function deleteWindow (hash) {
	const windowData = store.window[hash];

	delete store.window[hash];
	store.emit('window-delete', windowData);

	return windowData;
}

store.on('agent-delete', agentData => {
	agentData.windows.forEach(windowId => deleteWindow(windowId));
});

store.on('program-delete', programData => {
	const windowData = store.window[programData.windowId];

	if (windowData) {
		windowData.programId = null;
	}
});

exports.del = deleteWindow;
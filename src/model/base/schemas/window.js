const store = require('../store');

let counter = 1;

exports.addToAgent = function (agentId) {
	const agentData = store.agent[agentId];
	const windowId = counter++;

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
			alert: false,
			confirm: false,
			prompt: false
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

store.on('program-delete', programData => {
	const windowData = store.window[programData.windowId];

	if (windowData) {
		windowData.programId = null;
	}
});

exports.del = deleteWindow;
const _ = require('lodash');
const store = require('../store');

function Meta() {
	return { title: null, URL: null, referrer: null, domain: null };
}

function Rect() {//TODO screen
	return { width: 0, height: 0, top: 0, left: 0 };
}

exports.addToAgent = function (agentId, id, meta = Meta(), rect = Rect()) {
	if (!_.isNumber(agentId)) {
		throw new Error('AgentId MUST be a number.');
	}

	const now = Date.now();
	const agentData = store.agent[agentId];
	const windowData = store.window[id] = {
		id,
		agentId,
		createdAt: now,
		visitedAt: now,
		program: null,
		meta,
		rect, 
		dialog: { alert: null, confirm: null, prompt: null },
		upload: {
			pending: false,
			fileList: [] //TODO null
		}
	};

	agentData.windows.push(id);
	
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
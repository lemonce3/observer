const store = require('../store');

let counter = 1;

exports.add = function (masterId, windowId, name, args) {
	const id = counter++;
	const programData = store.program[id] = {
		id,
		masterId,
		windowId,
		name,
		args,
		exited: false,
		returnValue: undefined,
		error: null,

		createdAt: Date.now()
	};

	store.master[masterId].programs[id] = true;
	store.window[windowId].programId = programData.id;

	return programData;
};

exports.get = function (id) {
	return store.program[id];
};

function deleteProgram(id) {
	const programData = store.program[id];

	delete store.program[id];
	store.emit('program-delete', programData);

	return programData;
}

store.on('master-delete', masterData => {
	for (let programsId in masterData.programs) {
		deleteProgram(programsId);
	}
});

store.on('window-delete', windowData => {
	const programId = windowData.programId;
	
	if (programId) {
		const programData = store.program[programId];

		if (programData) {
			deleteProgram(programId);
		}
	}
});

exports.del = deleteProgram;
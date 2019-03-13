const _ = require('lodash');
const store = require('../store');

exports.add = function ({ hash, name, args, windowId, masterId }) {
	const programData = {
		hash, name, args, windowId, masterId,
		returnValue: undefined,
		error: null,
		calledAt: Date.now(),
		exitedAt: null,
	};

	store.program[hash] = programData;
	store.window[windowId].program = hash;
	store.master[masterId].programs.push(hash);

	return programData;
};

exports.del = function (hash) {
	const programData = store.program[hash];

	delete store.program[hash];

	return programData;
};

exports.get = function (hash) {
	return store.program[hash];
};

//TODO 这里会内存泄漏，但是并不严重
// store.on('master-delete', masterData => {
// 	Object.keys(masterData.programs).forEach(hash => delete store.program[hash]);
// });
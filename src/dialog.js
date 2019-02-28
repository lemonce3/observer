const closer = exports.close = {
	alert(resolve) {
		resolve();
	},
	confirm(resolve, value) {
		if (_.isBoolean(value)) {
			resolve(value);
		}
		
		throw new Error('Value of a confirm dialog MUST be a boolean.');
	},
	prompt(resolve, value) {
		if (_.isString(value)) {
			resolve(value);
		}
		
		throw new Error('Value of a prompt dialog MUST be a string.');
	}
};

exports.isValidType = function isValidType(typeName) {
	return Object.keys(closer).indexOf(typeName) !== -1;
};
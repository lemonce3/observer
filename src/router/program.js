const Router = require('koa-router');
const _ = require('lodash');
const { ProgramReturnValue, ProgramError } = require('../class/program');
const cache = require('../cache');

const router = module.exports = new Router({ prefix: 'program' });

router.param('programId', (id, ctx, next) => {
	if (!cache.program.has(id)) {
		return ctx.status = 404;
	}

	ctx.program = cache.program.get(id);

	return next();
}).get('/:programId/return', ctx => {
	if (ctx.isPending) {
		return ctx.status = 102;
	}

	const { error, returnValue } = ctx.program;

	ctx.body = error === null ? {
		type: 'returnValue',
		data: returnValue
	} : {
		type: 'error',
		data: error
	};

	cache.program.del(ctx.program.id);
}).post('/:programId/return', ctx => {
	const { isObject, value } = ctx.request.body;

	if (!_.isBoolean(isObject)) {
		return ctx.status = 400;
	}

	ctx.program.setReturn(new ProgramReturnValue(value, isObject));
}).post('/:programId/error', ctx => {
	const { type, message, stack } = ctx.request.body;

	if (!_.isString(type) || !_.isUndefined(type)) {
		return ctx.status = 400;
	}

	if (!_.isString(message)) {
		return ctx.status = 400;
	}

	if (!_.isString(stack)) {
		return ctx.status = 400;
	}

	ctx.program.setError(new ProgramError(type, message, stack));
});
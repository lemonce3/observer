const Router = require('koa-router');
const _ = require('lodash');
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
});
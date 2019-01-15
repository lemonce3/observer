const Router = require('koa-router');
const _ = require('lodash');

const { Master } = require('../class/master');
const { Program } = require('../class/program');
const cache = require('../cache');

const router = module.exports = new Router({ prefix: '/master' });

router.param('masterId', (id, ctx, next) => {
	if (!cache.master.has(id)) {
		return ctx.status = 404;
	}

	ctx.master = cache.master.get(id);

	return next();
}).get('/:masterId', ctx => {
	ctx.body = ctx.master;
}).post('/', ctx => {
	const master = new Master();

	cache.master.set(master.id, master);
	ctx.body = master;
}).delete('/:masterId', ctx => {
	cache.master.del(ctx.params.masterId);
	ctx.body = ctx.master;
}).post('/:masterId/agent', ctx => {
	const { name } = ctx.request.body;

	if (!_.isString(name)) {
		return ctx.status = 400;
	}

	const unbindAgentId = cache.agent.keys().find(id => {
		return cache.agent.peek(id).master === null;
	});

	if (unbindAgentId !== null) {
		return ctx.status = 409;
	}

	ctx.master.bind(ctx.body = cache.agent.get(unbindAgentId));
}).post('/:masterId/agent/:agentName/program', async ctx => {
	const { name, args } = ctx.request.body;

	if (!_.isString('name')) {
		return ctx.status = 400;
	}

	if (!Array.isArray(args)) {
		return ctx.status = 400;
	}

	const { agentName } = ctx.params;
	
	if (!ctx.master.agent[agentName]) {
		return ctx.status = 404;
	}

	const program = new Program(name, args);

	cache.program.set(program.id, program);
	ctx.master.execute(agentName, ctx.body = program);
});

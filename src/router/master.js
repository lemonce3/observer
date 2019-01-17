const Router = require('koa-router');
const _ = require('lodash');

const { Master } = require('../class/master');
const { Program } = require('../class/program');
const cache = require('../cache');

const router = module.exports = new Router({ prefix: '/master' });
const agentRouter = new Router({ prefix: '/agent' });

agentRouter.param('agentName', (id, ctx, next) => {
	const agent = ctx.master.agent[id];

	if (!agent) {
		return ctx.status = 404;
	}

	ctx.agent = agent;

	return next();
}).post('/', ctx => {
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
}).del('/:agentName', ctx => {
	ctx.master.unbind(ctx.params.agentName);
	ctx.body = ctx.agent;
}).post('/:agentName/program', async ctx => {
	const { name, args, timeout } = ctx.request.body;

	if (!_.isString('name')) {
		return ctx.status = 400;
	}

	if (!Array.isArray(args)) {
		return ctx.status = 400;
	}

	const program = new Program(name, args);

	cache.program.set(program.id, program, timeout);
	ctx.master.execute(ctx.params.agentName, ctx.body = program);
});

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
	ctx.master.unbindAll();
	cache.master.del(ctx.params.masterId);
	ctx.body = ctx.master;
}).get('/:masterId/log', ctx => {
	ctx.body = ctx.master.log;
}).post('/:masterId/log', ctx => {
	const { message, namespace } = ctx.request.body;
	
	ctx.body = ctx.master.pushLog(message, namespace);
}).del('/:masterId/log', ctx => {
	ctx.body = ctx.master.clearLog();
}).use('/:masterId', agentRouter.routes());
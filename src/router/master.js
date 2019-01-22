const Router = require('koa-router');
const _ = require('lodash');

const cache = require('../cache');

const router = module.exports = new Router({ prefix: '/master' });
const agentRouter = new Router({ prefix: '/agent' });
const windowRouter = new Router({ prefix: '/window' });
const logRouter = new Router({ prefix: '/log' });

windowRouter.param('windowId', (id, ctx, next) => {
	const window = ctx.window =
		ctx.agentInstance.windowRegistry.idIndex[id];

	return window ? next() : ctx.status = 404;
}).post('/:windowId/program', ctx => {
	const { agentId, windowId } = ctx.params;
	const { name, args, timeout } = ctx.request.body;

	if (!_.isString('name')) {
		return ctx.status = 400;
	}

	if (!Array.isArray(args)) {
		return ctx.status = 400;
	}

	const program = cache.createProgram(agentId, windowId, {
		name, args, timeout
	});

	ctx.body = program;
});

logRouter.get('/', ctx => {
	ctx.body = ctx.masterInstance.log;
}).post('/', ctx => {
	const { message, namespace = '*' } = ctx.request.body;
	
	ctx.body = ctx.masterInstance.pushLog(message, namespace);
}).del('/', ctx => {
	ctx.body = ctx.masterInstance.clearLog();
});

agentRouter.param('agentId', (id, ctx, next) => {
	const agent = ctx.masterInstance.agents[id];

	if (!agent) {
		return ctx.status = 404;
	}

	ctx.agentInstance = agent;

	return next();
}).post('/', ctx => {
	const agent = cache.getIdleAgent();

	if (!agent) {
		return ctx.status = 409;
	}

	ctx.masterInstance.bind(agent);
	ctx.body = cache.ModelAgent(agent);
}).del('/:agentId', ctx => {
	ctx.masterInstance.unbind(ctx.params.agentId);
	ctx.body = cache.ModelAgent(ctx.agentInstance);
}).use('/:agentId', windowRouter.routes());

router.param('masterId', (id, ctx, next) => {
	const master = ctx.master = cache.getMaster(id);
	
	return master ? next() : ctx.status = 404;
}).post('/', ctx => {
	ctx.body = cache.createMaster();
}).get('/:masterId', ctx => {
	ctx.body = ctx.master;
}).delete('/:masterId', ctx => {
	cache.master.del(ctx.params.masterId);
	ctx.body = ctx.master;
}).use('/:masterId', (ctx, next) => {
	ctx.masterInstance = cache.master.get(ctx.master.id);

	return next();
}, agentRouter.routes(), logRouter.routes());
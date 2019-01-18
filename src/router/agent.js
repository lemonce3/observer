const Router = require('koa-router');
const fs = require('fs');
const path = require('path');

const { Agent } = require('../class/agent');
const { Window } = require('../class/window');
const cache = require('../cache');

const router = module.exports = new Router({ prefix: '/agent' });
const windowRouter = new Router({ prefix: '/window' });
const fetchHTML = fs.readFileSync(path.resolve('src/fetch.html'));
const COOKIE_KEY = 'LC_AGENT';

windowRouter.param('windowId', (id, ctx, next) => {
	const window = ctx.window = ctx.agent.getWindow(id);
	
	if (!window) {
		return ctx.status = 404;
	}

	window.visit();

	return next();
}).post('/', ctx => {
	ctx.agent.appendWindow(ctx.body = new Window());
}).get('/:windowId', ctx => {
	ctx.body = ctx.window;
}).del('/:windowId', ctx => {
	ctx.agent.removeWindow(ctx.params.windowId);
	ctx.body = ctx.window;
});

router.param('agentId', (id, ctx, next) => {
	const agent = cache.agent.get(id);

	if (!agent) {
		return ctx.status = 404;
	}

	ctx.agent = agent;

	return next();
}).get('/fetch', ctx => {
	const agentId = ctx.cookies.get(COOKIE_KEY);
	//TODO 可以通过query创建带有meta数据的agent用于标识资源角色

	if (!agentId || !cache.agent.get(agentId)) {
		const newAgent = new Agent();

		cache.agent.set(newAgent.id, newAgent);
		ctx.cookies.set(COOKIE_KEY, newAgent.id, { httpOnly: false, maxAge: 0 });
	}

	ctx.response.type = 'text/html; charset=utf-8';
	ctx.body = fetchHTML;
}).use('/:agentId', windowRouter.routes());
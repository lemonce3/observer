const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const sha1 = require('hash.js').sha1;

const { Agent, Window } = require('../class/agent');
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
	ctx.agent.append(ctx.body = new Window());
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
}).get('/fetch.html', ctx => {
	const agentId = ctx.cookies.get(COOKIE_KEY);
	//TODO 可以通过query创建带有meta数据的agent用于标识资源角色

	if (!agentId || !cache.agent.has(agentId)) {
		const newAgentId = sha1().update(new Date().toISOString()).digest('hex');
		const newAgent = new Agent(newAgentId);

		cache.agent.set(newAgentId, newAgent);
		ctx.cookies.set(COOKIE_KEY, newAgentId, { httpOnly: false, maxAge: 0 });
	}

	ctx.response.type = 'text/html; charset=utf-8';
	ctx.body = fetchHTML;
}).get('/:agentId', ctx => {
	ctx.body = ctx.agent;
}).use('/:agentId', windowRouter.routes());
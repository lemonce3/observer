const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const cache = require('../cache');
const _ = require('lodash');

const router = module.exports = new Router({ prefix: '/agent' });
const windowRouter = new Router({ prefix: '/window' });
const fetchHTML = fs.readFileSync(path.resolve('src/fetch.html'));
const COOKIE_KEY = 'LC_AGENT';

windowRouter.param('windowId', (id, ctx, next) => {
	const window = ctx.window = cache.getWindow(id);
	
	return window ? next() : ctx.status = 404;
}).post('/', ctx => {
	ctx.body = cache.createWindow(ctx.agent.id);
}).put('/:windowId', ctx => {
	ctx.body = ctx.window;
	ctx.body.agentId = ctx.agent.id;
	ctx.body.masterId = ctx.agent.master;
}).del('/:windowId', ctx => {
	cache.window.del(ctx.window.id);
	ctx.body = ctx.window;
}).post('/:windowId/dialog', async ctx => {
	const { type, message = '' } = ctx.request.body;
	const window = cache.window.get(ctx.window.id);

	if (type !== 'alert' && type !== 'confirm' && type !== 'prompt') {
		return ctx.status = 400;
	}
	
	try {
		ctx.body = {
			value: await window.setDialog(type, message)
		};
	} catch (error) {
		return ctx.status = 408;
	}

}).post('/:window/program/:programId/exit', ctx => {
	const { error, returnValue } = ctx.request.body;

	if (error === undefined && returnValue === undefined) {
		return ctx.status = 400;
	}

	if (error && !validateProgramError(error)) {
		return ctx.status = 400;
	}

	const { programId } = ctx.params;
	const program = cache.program.get(programId);

	if (!program) {
		return ctx.status = 404;
	}

	cache.exitProgram(ctx.params.programId, {
		error, returnValue
	});

	ctx.body = cache.getProgram(programId);
});

router.param('agentId', (id, ctx, next) => {
	const agent = ctx.agent = cache.getAgent(id);

	return agent ? next() : ctx.status = 404;
}).get('/fetch', ctx => {
	const agentId = ctx.cookies.get(COOKIE_KEY);
	//TODO 可以通过query创建带有meta数据的agent用于标识资源角色

	if (!agentId || !cache.agent.get(agentId)) {
		const newAgent = cache.createAgent();

		ctx.cookies.set(COOKIE_KEY, newAgent.id, { httpOnly: false, maxAge: 0 });
	}

	ctx.response.type = 'text/html; charset=utf-8';
	ctx.body = fetchHTML;
}).use('/:agentId', windowRouter.routes());

function validateProgramError({ type, message }) {
	if (!_.isString(type) && !_.isUndefined(type)) {
		return false;
	}

	if (!_.isString(message)) {
		return false;
	}

	return true;
}
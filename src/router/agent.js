const fs = require('fs');
const path = require('path');
const Router = require('koa-router');
const { Agent } = require('../model');

const router = module.exports = new Router();
const agentHTML = fs.readFileSync(path.resolve(__dirname, 'assets/fetch.html'), 'utf-8');
const COOKIE_KEY = 'LC_AGENT';

router.get('/agent.html', ctx => {
	const agentId = ctx.cookies.get(COOKIE_KEY);
	let agent = null;
	
	if (!agentId || !(agent = Agent.selectById(agentId))) {
		agent = Agent.create(ctx.request.header['User-Agent']);
		ctx.cookies.set(COOKIE_KEY, agent.data.id, { httpOnly: false, maxAge: 0 });
	}

	ctx.response.type = 'text/html; charset=utf-8';
	ctx.body = agentHTML.replace('__REPLACEMENT__', JSON.stringify({
		agentId: agent.data.id
	}));
});

router.get('/agent', ctx => {
	ctx.body = Agent.selectAll();
});

const fs = require('fs');
const path = require('path');
const Router = require('koa-router');
const { Agent } = require('../model');

const router = module.exports = new Router();
const agentHTML = fs.readFileSync(path.resolve(__dirname, 'assets/fetch.html'));
const COOKIE_KEY = 'LC_AGENT';

router.get('/agent.html', ctx => {
	const agentId = ctx.cookies.get(COOKIE_KEY);
	let agent = null;

	if (agentId) {
		agent = Agent.selectById(agentId);
	} else {
		agent = Agent.create();
		ctx.cookies.set(COOKIE_KEY, agent.id, { httpOnly: false, maxAge: 0 });
	}

	ctx.response.type = 'text/html; charset=utf-8';
	ctx.body = agentHTML.replace('__REPLACEMENT__', JSON.stringify(agent.model));
});

router.put('/agent/:agentId', ctx => {
	const { agentId } = ctx.params;
	const agent = Agent.selectById(agentId);

	if (agent === null) {
		ctx.status = 404;
	}

	agent.visit();

	const frontend = ctx.body;

	//TODO 更新pointer
	agent.update(frontend);
	
	//TODO 打开窗口
	agent.appendWindow();

	//TODO 更新窗口
	agent.updateWindow();

	//TODO 销毁窗口
	agent.removeWindow();

	//TODO 更新程序返回
	agent.exitProgram();

});

const DIALOG_TIMEOUT = 10000;

router.post('/agent/:agentId/window/:windowId/dialog', async ctx => {
	const { agentId, windowId } = ctx.params;
	const { type, message } = ctx.body;

	if (type !== 'alert' && type !== 'confirm' && type !== 'prompt') {
		return ctx.status = 400;
	}

	const agent = Agent.selectById(agentId);

	if (!agent) {
		return ctx.status = 404;
	}

	try {
		const ticket = agent.openDialogByWindow(windowId, type, message);
		let timer = null;

		await new Promise((resolve, reject) => {
			ctx.dialog[ticket] = resolve;

			timer = setTimeout(() => reject(new Error('Dialog timeout')), DIALOG_TIMEOUT);
		}).then(() => {
			clearTimeout(timer);
		});
	} catch (error) {
		return ctx.throw(500, error.message);
	}
});
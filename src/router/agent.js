const fs = require('fs');
const path = require('path');
const Router = require('koa-router');
const { Agent, Window } = require('../model');
const dialog = require('../dialog');

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

router.get('/agent', ctx => {
	ctx.body = Agent.selectAll();
});

router.post('/window', function () {

});

router.put('/window/:windowId', function () {

});

router.del('/window/:windowId', function () {

});

const DIALOG_TIMEOUT = 10000;

router.post('/window/:windowId/dialog', async ctx => {
	const { windowId } = ctx.params;
	const { type, message } = ctx.body;

	if (!dialog.isValidType(type)) {
		return ctx.status = 400;
	}

	const window = Window.select(windowId);

	if (!window) {
		return ctx.status = 404;
	}

	const ticket = Math.random().toString(16).substr(2, 8);
	window.openDialog(type, message, ticket);

	await new Promise((resolve, reject) => {
		ctx.dialog[ticket] = resolve;

		return setTimeout(() => {
			reject(new Error('Dialog timeout'));
		}, DIALOG_TIMEOUT);
	}).then(timer => {
		clearTimeout(timer);
	}, () => {
		ctx.status = 504;
	}).finally(() => {
		delete ctx.dialog[ticket];
	});
});
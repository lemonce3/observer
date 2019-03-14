const Router = require('koa-router');
const router = module.exports = new Router();
const dialog = require('../dialog');
const _ = require('lodash');
const { Window, Agent } = require('../model');

const DIALOG_TIMEOUT = 10000;

router.post('/window', ctx => {
	const { agentId } = ctx.request.body;

	if (!_.isNumber(agentId)) {
		return ctx.status = 400;
	}

	if (Agent.selectById(agentId) === null) {
		return ctx.throw(404, 'Agent is NOT found.');
	}

	ctx.body = Window.create(agentId).model;
});

router.put('/window/:windowId', ctx => {
	const { body } = ctx.request;
	const { windowId } = ctx.params;
	const window = Window.select(windowId);

	if (window === null) {
		return ctx.throw(404, 'Window is NOT found.');
	}

	Agent.selectById(window.data.agentId).visit();
	window.visit().update(body);

	const programBody = body.program;

	if (programBody && programBody.isExited) {
		const { error, returnValue } = programBody;

		window.exitProgram(error, returnValue);
	}

	ctx.body = window.model;
});

router.del('/window/:windowId', async ctx => {
	const { windowId } = ctx.params;
	const window = Window.select(windowId);

	if (window === null) {
		return ctx.throw(404, `Window[${windowId}] is NOT found.`);
	}

	return new Promise(resolve => {
		ctx.req.on('aborted', () => {
			console.log(1111);
			window.destroy();
			resolve();
		});
	});
});

router.post('/window/:windowId/dialog', async ctx => {
	const { windowId } = ctx.params;
	const { type, message, timeout } = ctx.request.body;

	if (!dialog.isValidType(type)) {
		return ctx.status = 400;
	}

	const window = Window.select(windowId);

	if (!window) {
		return ctx.status = 404;
	}

	const ticket = Math.random().toString(16).substr(2, 8);

	window.openDialog(type, message, ticket);

	let timer = null;

	await new Promise((resolve, reject) => {
		ctx.dialog[ticket] = resolve;
		timer = setTimeout(() => reject(new Error('Dialog timeout')), timeout || DIALOG_TIMEOUT);
	}).then(value => {
		ctx.body = { value };
		clearTimeout(timer);
	}, () => {
		ctx.status = 504;
	}).finally(() => {
		delete ctx.dialog[ticket];
	});
});
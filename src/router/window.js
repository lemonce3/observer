const Router = require('koa-router');
const router = module.exports = new Router();
const dialog = require('../dialog');
const _ = require('lodash');
const { Window, Program, Agent } = require('../model');

const DIALOG_TIMEOUT = 10000;

router.post('/window', ctx => {
	const { agentId } = ctx.body;

	if (!_.isNumber(agentId)) {
		return ctx.status = 400;
	}

	const window = Window.create(agentId);

	ctx.body = window.model;
});

router.put('/window/:windowId', ctx => {
	const { body } = ctx.body;
	const { windowId } = ctx.params;
	const window = Window.select(windowId);

	if (window === null) {
		return ctx.status = 404;
	}

	Agent.selectById(window.data.agentId).visit();	
	window.visit().update(body);

	const programBody = body.program;

	if (programBody !== null && programBody.exited) {
		const { id, error, returnValue, isExited } = programBody;
		const program = Program.select(id);

		if (isExited) {
			program.exit(error, returnValue);
		}
	}

	ctx.body = window.model;
});

router.del('/window/:windowId', ctx => {
	const { windowId } = ctx.params;
	const window = Window.select(windowId);

	if (window === null) {
		return ctx.status = 404;
	}

	ctx.body = window.model;
	
	window.destroy();
});

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

	let timer = null;

	await new Promise((resolve, reject) => {
		ctx.dialog[ticket] = resolve;
		timer = setTimeout(() => reject(new Error('Dialog timeout')), DIALOG_TIMEOUT);
	}).then(value => {
		ctx.body = { value };
		clearTimeout(timer);
	}, () => {
		ctx.status = 504;
	}).finally(() => {
		delete ctx.dialog[ticket];
	});
});
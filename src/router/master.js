const Router = require('koa-router');
const router = module.exports = new Router();
// const dialog = require('../dialog');
const _ = require('lodash');
const { Master, Window, Agent } = require('../model');

const DIALOG_TYPE_LIST = ['alert', 'confirm', 'prompt'];

router.post('/master', ctx => {
	const { agents = [] } = ctx.request.body;

	if (!_.isArray(agents)) {
		return ctx.throw(400, 'Agents must be an array.');
	}

	if (agents.find(agentId => Agent.selectById(agentId) === null)) {
		return ctx.throw(404, 'A specific agent is NOT found.');
	}

	if (agents.find(agentId => Agent.selectById(agentId).data.masterId !== null)) {
		return ctx.throw(409, 'A specific agent is busy.');
	}

	const master = Master.create();
	agents.forEach(agentId => master.bind(agentId));
	
	ctx.body = master.model;
});

router.put('/master/:masterId', ctx => {
	const { body } = ctx.request;
	const { masterId } = ctx.params;
	const master = Master.select(masterId);

	if (!master) {
		ctx.throw(404, `Master(id:${masterId} is NOT found.)`);
	}
	
	master.visit();

	Object.keys(body.agents).forEach(agentId => {
		const agent = Agent.selectById(agentId);
		const agentBody = body.agents[agentId];

		agent.update(agentBody);

		agentBody.windows.forEach(windowBody => {
			const window = Window.select(windowBody.id);

			/**
			 * Resolve dialog
			 */
			DIALOG_TYPE_LIST.forEach(type => {
				const dialogBody = windowBody.dialog[type];

				if (dialogBody !== null && dialogBody.value !== undefined) {
					const resolve = ctx.dialog[window.closeDialog(type)];

					resolve && resolve(dialogBody.value);
				}
			});

			/**
			 * Call program
			 */
			const newProgram = Object.values(body.programs).find(programBody => programBody.windowId === windowBody.id);

			if (windowBody.program === null && newProgram) {
				const { hash, name, args, timeout } = newProgram;

				window.callProgram(hash, name, args, timeout);
			}
		});
	});

	master.data.programs.forEach(hash => {
		if (!body.programs[hash]) {
			master.deleteProgram(hash);
		}
	});

	ctx.body = master.model;
});

router.del('/master/:masterId', ctx => {
	const { masterId } = ctx.params;
	const master = Master.select(masterId);

	if (!master) {
		ctx.throw(404, `Master(id:${masterId} is NOT found.)`);
	}

	ctx.body = master.model;
	master.destroy();
});

// router.get('/master/:masterId/log', ctx => {
// 	const { masterId } = ctx.params;
// 	const master = Master.select(masterId);

// 	if (!master) {
// 		ctx.throw(404, `Master(id:${masterId} is NOT found.)`);
// 	}

// 	ctx.body = master.data.log;
// });

// router.post('/master/:masterId/log', ctx => {
// 	const { masterId } = ctx.params;
// 	const master = Master.select(masterId);

// 	if (!master) {
// 		ctx.throw(404, `Master(id:${masterId} is NOT found.)`);
// 	}

// 	ctx.body = master.data.log;
// });
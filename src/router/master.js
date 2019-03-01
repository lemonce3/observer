const Router = require('koa-router');
const router = module.exports = new Router();
const dialog = require('../dialog');
const _ = require('lodash');
const { Master, Window, Program, Agent } = require('../model');

const DIALOG_TYPE_LIST = [];

router.post('/master', ctx => {
	const { agents } = ctx.body;

	const master = Master.create();
	agents.forEach(agentId => master.bind(agentId));
	
	ctx.body = master.model;
});

router.put('/master/:masterId', ctx => {
	const { body } = ctx.body;
	const { masterId } = ctx.params;
	const master = Master.select(masterId);

	if (!master) {
		ctx.throw(404, `Master(id:${masterId} is NOT found.)`);
	}
	
	master.visit();

	/**
	 * If the program data is not in body program, destroy it.
	 */
	Object.keys(master.data.programs).map(programId => {
		return Program.select(programId);
	}).filter(program => {
		return !body.programs[program.data.id];
	}).forEach(program => {
		program.destroy();
	});

	/**
	 * If the body data is not in program data, create it.
	 */
	Object.keys(body.programs).forEach(program => {
		if (Program.select(program.id) === null) {
			Program.create(masterId, program.windowId, program.name, program.args);
		}
	});

	/**
	 * If dialog value assigned, resolve it.
	 */
	Object.keys(body.agents).forEach(agentId => {
		const agent = Agent.selectById(agentId);
		const agentBody = body.agents[agentId];

		agent.update(agentBody);

		agentBody.windows.forEach(windowBody => {
			DIALOG_TYPE_LIST.forEach(type => {
				const dialogBody = windowBody.dialog[type];

				if (dialogBody !== null && dialogBody.value !== null) {
					const window = Window.select(windowBody.id);

					ctx.dialog[window.closeDialog(type)](dialogBody.value);
				}
			});
		});
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
const Router = require('koa-router');

const cache = require('../cache');
const masterRouter = require('./master');
const agentRouter = require('./agent');
const consoleRouter = require('./console');

const router = module.exports = new Router({ prefix: '/api' });

router.get('/program/:programId', ctx => {
	const { programId } = ctx.params;
	if (!cache.program.has(programId)) {
		return ctx.status = 404;
	}

	ctx.body = cache.getProgram(programId);
});
router.use(agentRouter.routes());
router.use(masterRouter.routes());
router.use(consoleRouter.routes());
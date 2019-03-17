const Router = require('koa-router');

const masterRouter = require('./master');
const agentRouter = require('./agent');
const windowRouter = require('./window');
const fileRouter = require('./file');

const router = module.exports = new Router({ prefix: '/api' });

router.use(agentRouter.routes());
router.use(masterRouter.routes());
router.use(windowRouter.routes());
router.use(fileRouter.routes());
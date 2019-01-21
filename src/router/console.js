const Router = require('koa-router');
const cache = require('../cache');

const router = module.exports = new Router({ prefix: '/console' });

router.get('/master', ctx => {
	ctx.body = cache.getAllMaster();
}).get('/agent', ctx => {
	ctx.body = cache.getAllAgent();
}).get('/program', ctx => {
	ctx.body = cache.getAllProgram();
});
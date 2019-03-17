const path = require('path');
const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const serve = require('koa-static');

global.config = require(path.resolve('config.json'));

const router = require('./src/router');
const app = new Koa();

app.context.OBSERVER_HASH = Math.random().toString(16).substr(2, 8);
app.context.dialog = {};

const fileRouter = /\/file/;

app.use(async (ctx, next) => {
	if (fileRouter.test(ctx.path)) {
		ctx.disableBodyParser = true;
	};

	return next();
});
app.use(bodyparser());
app.use(router.routes());
app.use(serve(path.resolve(config.static.path)));

app.listen(config.http.port, config.http.host);

console.log(`Host: ${config.http.host}, Port: ${config.http.port}`);
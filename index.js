const path = require('path');
global.config = require(path.resolve('config.json'));

const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const serve = require('koa-static');
const LRU = require('lru-cache');

const router = require('./src/router');
const app = new Koa();

app.use(bodyparser());
app.use(router.routes());
app.use(serve(path.resolve(config.static.path)));

app.listen(config.http.port, config.http.host);
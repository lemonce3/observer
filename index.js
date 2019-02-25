const randexp = require('randexp');
const OBSERVER_HASH = randexp(/[a-f0-9]{8}/);

const path = require('path');
const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const serve = require('koa-static');

global.config = require(path.resolve('config.json'));

const router = require('./src/router');
const app = new Koa();

app.context.dialog = {};
app.use(bodyparser());
app.use(router.routes());
app.use(serve(path.resolve(config.static.path)));

app.listen(config.http.port, config.http.host);
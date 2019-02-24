const randexp = require('randexp');
const OBSERVER_HASH = randexp(/[a-f0-9]{8}/);

const path = require('path');
const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const serve = require('koa-static');
const LRU = require('lru-cache');

module.exports = {
	program: new LRU({ maxAge: 60 * 1000 }),
	master: new LRU({ maxAge: 15 * 60 * 1000 }),
	agent: new LRU({ maxAge: 15 * 60 * 1000 })
};
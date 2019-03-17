const Router = require('koa-router');
const router = module.exports = new Router();

const store = {};

router.post('/file', async ctx => {
	const { hash } = ctx.query;

	let data = Buffer.from([]);

	await new Promise((resolve) => {
		ctx.req.on('data', chunk => {
			data = Buffer.concat([data, chunk], data.length + chunk.length);
		});
	
		ctx.req.on('end', () => {
			store[hash] = {
				blob: data,
				type: ctx.headers['content-type'],
				_time: Date.now()
			};
		
			resolve();
		});

	});
	
	ctx.body = 0;
});

router.get('/file/:hash', ctx => {
	const file = store[ctx.params.hash];

	ctx.type = file.type;
	ctx.body = file.blob;
});
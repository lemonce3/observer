const assert = require('assert');
const _ = require('lodash');
const axios = require('axios');

const cache = global.cache = require('../src/cache');

describe.skip('API-master', function () {
	require('../');
	
	const masterIdReg = /[a-z0-9]{40}/;
	const masterAxios = axios.create({
		baseURL: `${config.serverName}/api`,
	});
	
	describe('POST /master', function () {

		it('should respond 200 & master entry', async function () {
			const response = await masterAxios.post('/master');
			const { data, status } = response;

			assert.equal(status, 200);
			assert(masterIdReg.test(data.id));
			assert(cache.master.get(data.id));
		});

	});

	describe('GET /master/:masterId', function () {

		it('should get the specific master entry', async () => {

		});

		it('should get the same master in 10 secs', (done) => {
			setTimeout(async () => {

				done();
			}, 6000);
		});

		it('should get the same master in another 10 secs', (done) => {
			setTimeout(async () => {

				done();
			}, 6000);
		});

		it('should not found the master had been gone after 10 secs', (done) => {
			setTimeout(async () => {

				done();
			}, 12000);
		});
		
	});

	describe('DELETE /master/:masterId', function () {
		it('should remove a specific master from cache');

		it('should not remove the master again & respond 404');
	});

	describe('POST /master/:masterId/log', function () {
		it('should be appended a new log record');
	});

	describe('GET /master/:masterId/log', function () {
		it('should get all log of the specific master');
	});

	describe('DELETE /master/:masterId/log', function () {
		it('should clear all log of the specific master');
	});

	describe('POST /master/:masterId/agent', function () {
		it('should let a master bind a idle agent');
		it('should not bind success when no idle agent');
	});

	describe('DELETE /master/:masterId/agent/:agentName', function () {
		it('should unbind a specific agent of the master');
	});

	describe('POST /master/:masterId/agent/:agentName/program', function () {
		it('should make a program calling to specific agent & window in the master');
	});
	
	describe('PATCH /master/:masterId/agent/:agentName/window/name', function () {
		it('should set the name of a specific window by query');
		
	});
	
});
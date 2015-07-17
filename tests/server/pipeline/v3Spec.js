
'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var Pipeline	= require('../../../dist/pipelines').v3;

var message = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
var e, g;

describe('Pipeline', function () {

	it('Time each message', done => {
		
		var spy = sinon.spy();
		var pipeline = new Pipeline();
		pipeline.on(spy);

		return pipeline
			.process(message)
			.then(event => {
				expect(spy.lastCall.args[0].egest.annotations.pipeline.execution_time[1]).to.match(/^[\d]+$/);
				done();
			})
		
	})

	it('Process a message', done => {
		
		var spy = sinon.spy();
		var pipeline = new Pipeline();
		pipeline.on(spy);

		return pipeline
			.process(message)
			.then(event => {
				console.log('*****', spy.lastCall.args[0].egest.annotations);
				expect(spy.callCount).to.equal(1);
				done();
			})
	});

});

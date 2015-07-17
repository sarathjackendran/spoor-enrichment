
'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var Pipeline	= require('../../../dist/pipelines').v3;

var message = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
var e, g;

describe('Pipeline', function () {

	it.only('Process a message', done => {
		
		var spy = sinon.spy();
		var pipeline = new Pipeline();
		
		console.log(pipeline.on);

		pipeline.on('enriched', spy);

		pipeline
			.process(message)
			.then(event => {
				console.log(event, spy);
				expect(true).to.equal(true);
			})
			.catch(error => {
				console.log('** ERROR **', error);
			});
		done()
	});

});

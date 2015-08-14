
'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var context     = require('../../../dist/transforms').context;
var EventModel	= require('../../../dist/models').EventModel;

var error = m => console.log(m);
var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
var rawSqs__context_id = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--context-id', { encoding: 'utf8' }));

const uuid_v3 = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

describe('Context', () => {

	it('Should generate a UUID if the event does not contain a context id', done => {
		context(new EventModel(rawSqs))
			.then(context => {
				expect(context.id).to.match(uuid_v3);
				done();
			})
			.catch(error);
	});
	
	it('Should return an existing context if it exists on the event', done => {
		context(new EventModel(rawSqs__context_id))
			.then(context => {
				expect(context.id).to.equal('123');
				done();
			})
			.catch(error);
	});

});

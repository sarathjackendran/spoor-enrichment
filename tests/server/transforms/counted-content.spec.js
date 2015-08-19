
'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var countedContent	= require('../../../dist/transforms').countedContent;
var EventModel		= require('../../../dist/models').EventModel;

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));

describe('Counted content', () => {

	it('Subscriber-only article should be marked as counted', done => {
		var e = new EventModel(rawSqs);
		e.annotate('content_v1', { classification: 1 });
		countedContent(e)
			.then(counted => {
				expect(counted.isCountedContent).to.equal(true);
				done();
			})
			.catch(e => console.log(e));
	});
	
	it('Free content should not be marked as counted content', done => {
		var e = new EventModel(rawSqs);
		e.annotate('content_v1', { classification: 2 });
		countedContent(e)
			.then(counted => {
				expect(counted.isCountedContent).to.equal(false);
				done();
			})
			.catch(e => console.log(e));
	});

});

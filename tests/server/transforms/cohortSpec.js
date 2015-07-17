
'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var cohort      = require('../../../dist/transforms').cohort;
var EventModel	= require('../../../dist/models').EventModel;

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
var rawSqs__no_cohorts = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--no-cohorts', { encoding: 'utf8' }));
var e;

describe('Cohort', function () {

	it('Determine cohort from the HTTP Cookie', done => {
		e = new EventModel(rawSqs);
		cohort(e).then(cohorts => {
			expect(cohorts).to.deep.equal(['subscriber', 'registered']);
		});
		done()
	});
	
	it('Users with no products are anonymous', done => {
		e = new EventModel(rawSqs__no_cohorts);
		cohort(e).then(cohorts => {
			expect(cohorts).to.deep.equal([]);
		});
		done()
	});

});

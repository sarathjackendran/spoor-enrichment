/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect	= require('chai').expect;
var sinon	= require('sinon');
var fs		= require('fs');

var EventModel = require('../../../dist/models').EventModel;
var isValidSource = require('../../../dist/filters').isValidSource;

var rawSqs = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest', { encoding: 'utf8' }));
var rawSqs__valid_message = JSON.parse(fs.readFileSync('./tests/server/fixtures/ingest--valid-message', { encoding: 'utf8' }));

describe('Source validation', function () {
	
	it('Mark messages without action, category, source as invalid', done => {
		var e = new EventModel(rawSqs);
		isValidSource(e);
		expect(e.annotations().validation.isValid).to.be.false;
		done();
	});
	
	it('Must specify the action, category, source of an event', done => {
		var e = new EventModel(rawSqs__valid_message);
		isValidSource(e);
		expect(e.annotations().validation.isValid).to.be.true;
		done();
	});

});

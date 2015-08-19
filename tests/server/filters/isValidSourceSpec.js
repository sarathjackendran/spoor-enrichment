/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect			= require('chai').expect;
var sinon			= require('sinon');
var fixtures		= require('../../utils/fixtures');
var isValidSource	= require('../../../dist/filters').isValidSource;

var error = err => console.error(err);

describe('Source validation', function () {
	
	it('Mark messages without action, category, source as invalid', done => {
		isValidSource(fixtures.sqs.get('event'))
			.then(event => {
				expect(event.isValid).to.be.false;
				done();
			}).catch(error);
	});
	
	it('Must specify the action, category, source of an event', done => {
		isValidSource(fixtures.sqs.get('valid-event'))
			.then(event => {
				expect(event.isValid).to.be.true;
				done();
			}).catch(error);
	});

});

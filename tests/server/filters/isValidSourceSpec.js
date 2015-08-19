/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect		= require('chai').expect;
var sinon		= require('sinon');
var fixtures	= require('../../utils/fixtures');

var isValidSource = require('../../../dist/filters').isValidSource;

describe('Source validation', function () {
	
	it('Mark messages without action, category, source as invalid', done => {
		isValidSource(fixtures.sqs.get('event')).then(event => {
			expect(event.isValid).to.be.false;
		});
		done();
	});
	
	it('Must specify the action, category, source of an event', done => {
		isValidSource(fixtures.sqs.get('invalid-event')).then(event => {
			expect(event.isValid).to.be.true;
		});
		done();
	});

});

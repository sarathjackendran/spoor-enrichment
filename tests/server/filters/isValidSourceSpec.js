/* global beforeEach, afterEach, describe, it, console */

'use strict';

var expect			= require('chai').expect;
var fixtures		= require('../../utils/fixtures');
var isValidSource	= require('../../../dist/filters').isValidSource;
var sinon			= require('sinon');

var error = err => console.error(err);

describe('Source validation', function () {
	
	it('Mark messages without action, category, source as invalid', done => {
		let e = fixtures.sqs.get('event');
		sinon.stub(e, 'pluck', () => undefined);
		isValidSource(e)
			.then(event => {
				expect(event.isValid).to.be.false;
				done();
			}).catch(error);
	});
	
	it('Must specify the action, category, source of an event', done => {
		let e = fixtures.sqs.get('valid-event');
		sinon.stub(e, 'pluck', () => 'meep');
		isValidSource(e)
			.then(event => {
				expect(event.isValid).to.be.true;
				expect(e.pluck.callCount).to.equal(4);
				done();
			}).catch(error);
	});

});

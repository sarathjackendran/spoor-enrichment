
var fetch	= require('node-fetch');
var metrics = require('next-metrics');
var cohorts = require('../utils/ft-cohorts');

require('es6-promise').polyfill();

module.exports = (event) => {

	var cohort = [];

	metrics.count('pipeline.transforms.cohort.count', 1);

	var cookie = event.headers().cookie;

	if (cookie) {

		// PRODUCTS=_P1_P0_Tools_
		var match = cookie.match(/PRODUCTS=_([^:]+)/);
		
		if (match) {
			var products = match[1].split('_');
			cohort = products
				.filter((product) => { 
					return /^P/.test(product)
				})
				.map((product) => {
					return cohorts.get(product)
				});
		}
	}

	console.log('transforms/cohort', cohort);
	
	event.annotate('cohorts', cohort);
	return event;

}


var metrics = require('next-metrics');
var	uuid	= require('node-uuid');

module.exports = (event) => {
	
	return new Promise((resolve, reject) => {

		if (!process.env.transform_context && !process.env.mocha) {
			resolve({});
		}

		metrics.count('pipeline.transforms.context.count', 1);

		var context = event.pluck('context.id');

		resolve({ id: context || uuid() });
	})

}


var metrics = require('next-metrics');

module.exports = (event) => {
	
	return new Promise((resolve, reject) => {

		if (!process.env.transform_countedcontent && !process.env.mocha) {
			resolve({});
		}

		metrics.count('pipeline.transforms.counted_content.count', 1);

		var isCounted = event.annotations().content_v1 && /0|1|3/.test(event.annotations().content_v1.classification);

		resolve({ isCountedContent: !!isCounted });
	})

}


var AWS				= require('aws-sdk'); 

AWS.config.update({
	accessKeyId: process.env.accessKey, 
	secretAccessKey: process.env.secretAccessKey, 
	"region": "eu-west-1"
});

var cloudwatch = (metric, threshold) => {

	return new Promise((resolve, reject) => {
		new AWS.CloudWatch().getMetricStatistics({
			Statistics: [ "Sum" ],
			Dimensions: [ {"Name":"QueueName","Value":"spoor-ingest-v2"} ],
			MetricName: metric,
			Period: 60,
			EndTime: new Date().toISOString(),
			Namespace: "AWS/SQS",
			Unit: "Count",
			StartTime: new Date(new Date() - (30 * 60 * 1000)).toISOString()
		}, (err, data) => {
			
			if (err) {
				reject(err);
			}
			
			var series = data.Datapoints
				.sort((a, b) => {
					return new Date(a.Timestamp) > new Date(b.Timestamp) ? -1 : 1;
				})
				.slice(0, 3)
				.map(data => {
					data.ThresholdCrossed = threshold(data.Sum);
					return data;
				})
			
			resolve({
				name: metric,
				ok: series.some(datapoint => !datapoint.ThresholdCrossed),
				severity: 3,
				businessImpact: 'None',
				technicalSummary: 'http://spoor-docs.herokuapp.com/#health',
				panicGuide: 'http://spoor-docs.herokuapp.com/#panic',
				checkOutput: '-',
				threshold: threshold.toString(), 
				data: series
			})

		});
	});
}

module.exports = (req, res) => {
	
	res.set('Cache-Control', 'no-store');
	
	Promise.all([
			cloudwatch('ApproximateNumberOfMessagesVisible', v => v > 5000),
			cloudwatch('NumberOfMessagesReceived', v => v < 10000),
		])
		.then(metrics => {
			
			// 503 when a check is failing
			res.status(metrics.every(m => m.status) ? 200 : 503);
			
			res.json({
				schemaVersion: 1,
				name: 'spoor-enrichment',
				description: 'http://spoor-docs.herokuapp.com/#architecture',
				checks: metrics
			});
		})
		.catch(error => {
			
			// 503 when some underlying failure
			res.status(503);
			res.json({ error: error });
		
		})
}

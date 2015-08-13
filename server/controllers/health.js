
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
			
			var a = data.Datapoints
				.sort((a, b) => {
					return new Date(a.Timestamp) > new Date(b.Timestamp) ? -1 : 1;
				})
				.slice(0, 3)
				.map(data => {
					data.ThresholdCrossed = threshold(data.Sum);
					return data;
				})
			
			resolve({
				status: a.some(datapoint => !datapoint.ThresholdCrossed),
				data: a
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
			var [ApproximateNumberOfMessagesVisible, NumberOfMessagesReceived] = metrics;
			res.status(metrics.every(m => m.status) ? 200 : 500);
			res.json(metrics);
		})
		.catch(error => {
			res.json({ ok: 0 });
		})
}

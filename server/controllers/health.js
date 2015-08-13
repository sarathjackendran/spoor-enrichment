
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
			StartTime: new Date(new Date() - (60 * 60 * 1000)).toISOString()
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
					data.Threshold = threshold;
					data.ThresholdCrossed = data.Sum > threshold;
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
	
	res.set('Cache-Control', 'max-age=10');
	
	cloudwatch('ApproximateNumberOfMessagesVisible', parseInt(req.query.threshold) || 5000)
		.then(metrics => {
			res.status(metrics.status ? 200 : 500);
			res.json(metrics);
		})
		.catch(error => {
			res.json({ ok: 0 });
		})
}

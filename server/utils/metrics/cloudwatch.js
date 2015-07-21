
var AWS				= require('aws-sdk'); 
var metrics			= require('next-metrics');

AWS.config.update({
	accessKeyId: process.env.accessKey, 
	secretAccessKey: process.env.secretAccessKey, 
	"region": "eu-west-1"
});

var cloudwatch = new AWS.CloudWatch();

const metricKeys = [
		'SentMessageSize',
		'ApproximateNumberOfMessagesDelayed',
		'ApproximateNumberOfMessagesVisible',
		'NumberOfEmptyReceives',
		'NumberOfMessagesDeleted',
		'NumberOfMessagesReceived',
		'ApproximateNumberOfMessagesNotVisible',
		'NumberOfMessagesSent'
	]

setInterval(function () {

	metricKeys.forEach(function (metric) {
		
		cloudwatch.getMetricStatistics({
			Statistics: [ "Sum" ],
			Dimensions: [ {"Name":"QueueName","Value":"spoor-ingest-v2"} ],
			MetricName: metric,
			Period: 180,
			EndTime: new Date().toISOString(),
			Namespace: "AWS/SQS",
			StartTime: new Date(new Date() - (60 * 60 * 1000)).toISOString()
		}, function(err, data) {
			if (err) console.log(err, err.stack);
			else {
				data.Datapoints
					.sort(function (a, b) {
						return new Date(a.Timestamp) > new Date(b.Timestamp) ? -1 : 1;
					})
					.filter(function (a) {
						return a.Sum > 0;
					})
					.splice(0, 1)
					.forEach(function (e) {
						e.UnixTime = new Date(e.Timestamp).getTime()/1000;
						console.log('*', e);
						metrics.count('cloudwatch.' + metric, e.Sum);
					})
			}
		});

	});

}, 6000); 


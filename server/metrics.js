// `npm install rx randomstring es6-promise gulp babel gulp-babel` ; make run 

var AWS				= require('aws-sdk'); 
var metrics			= require('next-metrics')

metrics.init({ 
	app: 'spoor-enrichment',
	flushEvery: 70000
});

AWS.config.update({
	accessKeyId: process.env.accessKey, 
	secretAccessKey: process.env.secretAccessKey, 
	"region": "eu-west-1"
});

if (!process.env.metrics_cloudwatch) {
	require('./utils/metrics/cloudwatch');
}

if (!process.env.metrics_sqs) {
	require('./utils/metrics/sqsAttributes');
}

if (!process.env.metrics_fastly) {
	require('./utils/metrics/fastly');
}

console.log('collecting metrics');

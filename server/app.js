var express = require('express');
var app = express();
var fs = require('fs');

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'jade');

app.get('/', function(req, res) {
    res.set('Cache-Control', 'max-age: 10');
	res.render('pipeline', {
		
		pipeline: [
			{
				flag: 'pipeline_ingest',
				status: !!process.env.pipeline_ingest
			},
			{
				flag: 'use_domains',
				status: !!process.env.use_domains
			}
		],
		filters: [
			{ 
				flag: 'pipeline_model',
				status: !!process.env.pipeline_model
			}
		],
		transforms: [
			{
				flag: 'pipeline_geo',
				status: !!process.env.pipeline_geo
			},
			{
				flag: 'pipeline_ua',
				status: !!process.env.pipeline_ua
			},
			{
				flag: 'pipeline_url',
				status: !!process.env.pipeline_url
			},
			{
				flag: 'pipeline_apis',
				status: !!process.env.pipeline_apis
			},
			{
				flag: 'transform_ab',
				status: !!process.env.transform_ab
			},
			{
				flag: 'transform_capi',
				status: !!process.env.transform_capi
			},
			{
				flag: 'transform_capi_v1',
				status: !!process.env.transform_capi_v1
			},
			{
				flag: 'transform_session',
				status: !!process.env.transform_session
			},
			{
				flag: 'transform_ab',
				status: !!process.env.transform_ab
			}
		],
		sinks: [
			{
				flag: 'sink_kinesis',
				status: !!process.env.sink_kinesis
			},
			{
				flag: 'sink_sqs',
				status: !!process.env.sink_sqs
			}
		]
		
/*
dist//sinks/kinesis.js:	if (!process.env.sink_kinesis) {
dist//sinks/sqs.js:	if (!process.env.sink_sqs) {
*/

	});
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

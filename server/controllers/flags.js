
module.exports = (req, res) => {
    
	res.set('Cache-Control', 'max-age: 10');
	res.render('pipeline', {
		
		pipeline: [
			{
				flag: 'pipeline',
				status: !!process.env.pipeline,
				description: 'Send the incoming data from ingest down the pipeline. i.e. process the data'
			}
		],
		filters: [
			{ 
				flag: 'filter_validate',
				status: !!process.env.filter_validate,
				description: 'Events are validated according to the Spoor API spec. Invalid events are flagged as such.'
			}
		],
		transforms: [
			{
				flag: 'transform_geo',
				status: !!process.env.transform_geo,
				description: 'Annotates the event with geo-location data from MaxMind.'
			},
			{
				flag: 'transform_time',
				status: !!process.env.transform_ua,
				description: 'Annotates the event with various timings about the event (weekday, day of the week etc.).'
			},
			{
				flag: 'transform_ua',
				status: !!process.env.transform_ua,
				description: 'Annotates the event with browser and OS information.'
			},
			{
				flag: 'transform_ingest',
				status: !!process.env.transform_ingest,
				description: 'Annotates the event with the ingest message metadata.'
			},
			{
				flag: 'transform_url',
				status: !!process.env.transform_url,
				description: 'Annotates the event with a tokenised location and referrer information.'
			},
			{
				flag: 'transform_ab',
				status: !!process.env.transform_ab,
				description: 'Annotates the event with AB test segmentation data (next.ft.com only).'
			},
			{
				flag: 'transform_capi',
				status: !!process.env.transform_capi,
				description: 'Annotates the event with information from CAPI v2 (articles only).'
			},
			{
				flag: 'transform_capi_v1',
				status: !!process.env.transform_capi_v1,
				description: 'Annotates the event with information from CAPI v1 (articles only).'
			},
			{
				flag: 'transform_session',
				status: !!process.env.transform_session,
				description: 'Validates the event\'s FT session token with the Session API and returns the user\'s UUID.'
			},
			{
				flag: 'transform_cohort',
				status: !!process.env.transform_cohort,
				description: 'Annotates the event with the FT cohort data (Eg, registered, subscriber etc.)'
			},
			{
				flag: 'transform_context',
				status: !!process.env.transform_context,
				description: 'Annotates the event with a fresh context id (if one is not supplied by the event already).'
			},
			{
				flag: 'transform_myft',
				status: !!process.env.transform_myft,
				description: 'Annotates the event with information from myFT (next.ft.com only)'
			},
			{
				flag: 'transform_countedcontent',
				status: !!process.env.transform_countedcontent,
				description: 'Classifies articles as counted content (i.e. behind the paywall)'
			},
		],
		sinks: [
			{
				flag: 'sink_kinesis',
				status: !!process.env.sink_kinesis,
				description: 'Forwards events to Spoor Kinesis stream.'
			},
			{
				flag: 'sink_sqs',
				status: !!process.env.sink_sqs,
				description: 'Forwards events to the Spoor egest SQS queue.'
			},
			{
				flag: 'sink_stdout',
				status: !!process.env.sink_stdou,
				description: 'Sends the event (post-annotation) to STDOUT.'
			}
		],
		metrics: [
			{
				flag: 'metrics_cloudwatch',
				status: !!process.env.metrics_cloudwatch,
				description: 'Loads Cloudwatch metrics in to graphite.'
			},
			{
				flag: 'metrics_fastly',
				status: !!process.env.metrics_fastly,
				description: 'Loads Fastly metrics in to graphite.'
			},
			{
				flag: 'metrics_sqs',
				status: !!process.env.metrics_sqs,
				description: 'Loads SQS metrics in to graphite.'
			}
		]
	})
			  
};

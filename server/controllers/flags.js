
module.exports = (req, res) => {
    
	res.set('Cache-Control', 'max-age: 10');
	res.render('pipeline', {
		
		pipeline: [
			{
				flag: 'use_domains',
				status: !!process.env.use_domains,
				description: 'The pipeline uses node domains to catch errors.'
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
				flag: 'transform_apis',
				status: !!process.env.transform_apis,
				description: 'Allows the event to be annotated by various APIs. Essentially a master flag for API annotation.'
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
			}
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
			}
		]
	})
			  
};

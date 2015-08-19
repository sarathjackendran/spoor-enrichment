
var fs          = require('fs');
var EventModel  = require('../../dist/models').EventModel;

const event = name => {
	var f = fs.readFileSync(`./tests/fixtures/${name}`, { encoding: 'utf-8' });
	return new EventModel(f);
} 

const json = name => fs.readFileSync(`./tests/fixtures/${name}`, { encoding: 'utf-8' });

const sqs = new Map([
	['content-id', event('sqs/content-id')],
	['context-id', event('sqs/context-id')],
	['event', event('sqs/event')],
	['invalid-event', event('sqs/valid-event')],
	['no-cohorts', event('sqs/no-cohorts')],
	['no-message', event('sqs/no-message')],
	['no-referrer', event('sqs/no-referrer')],
	['no-session', event('sqs/no-session')],
	['no-time-received', event('sqs/no-time-received')],
	['no-user-agent', event('sqs/no-user-agent')],
	['referrer', event('sqs/referrer')],
	['session-id', event('sqs/session-id')],
	['time-offset', event('sqs/time-offset')],
	['url', event('sqs/url')],
	['user-agent', event('sqs/user-agent')]
]);

const capi_v1 = new Map([
	['response', json('capi-v1/response')]
])

const capi_v2 = new Map([
	['response', json('capi-v2/response')]
])

module.exports.sqs = sqs;
module.exports.capi_v1 = capi_v1;
module.exports.capi_v2 = capi_v2;

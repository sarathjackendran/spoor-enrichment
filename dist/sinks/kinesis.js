'use strict';

var AWS = require('aws-sdk');
var moment = require('moment');

AWS.config.update({
	accessKeyId: process.env.accessKey,
	secretAccessKey: process.env.secretAccessKey,
	'region': 'eu-west-1'
});

var kinesis = new AWS.Kinesis();

module.exports = function (message) {

	console.log('Writing message to Kinesis');

	// write to kinesis
	kinesis.putRecord({
		StreamName: 'spoor-egest', PartitionKey: 'event', Data: JSON.stringify(message)
	}, function (err, data) {
		console.log('ERROR', err, data);
	});
};
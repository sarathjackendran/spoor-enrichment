
var AWS				= require('aws-sdk'); 
var metrics			= require('next-metrics')

module.exports = function (message) {

	if (!process.env.sink_stdout) {
		console.log('sinks/stdout', 'stdout sink is turned off');
		return;
	} 

	console.log('sinks/stdout', message);

};


var Pusher			= require('pusher');

var pusher = new Pusher({
	appId: '120775',
	key: '49081db0b492f38c9f37',
	secret: '5a3aebf15ae9755a5677'
});

module.exports = function (message) {

	// 2% - this uses the FT's production pusher account. It must not be raised.
	if (Math.random() > 0.02) return;
	
	console.log('Writing message to Pusher');

	pusher.trigger('test_channel', 'my_event', {
		"message": { 
			referer: referrer,
			ua: ua, 
			country: country,
			isSubscriber: isSubscriber
		}
	});
	
};


module.exports = function (data) {
	return !!(data && data.event && data.event.source && data.event.action);
}

/*
	FIXME

   category, action and system are MANDATORY, everything else is OPTIONAL

	"category": "video",										// Category for this event e.g. page
	"action": "play",											// Action for this event e.g. view
	"system": {
		"source": "o-tracking",									// Name of the sender's system [1]
		"api-key":	"0f7464b4-3f4d-11e4-984b-00144feabdc0"		// Sender-specific key [6] - also in header
	}

*/

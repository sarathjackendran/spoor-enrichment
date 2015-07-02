
var flatten		= require('flat');

var EventModel = function (message) {
	this.ingest = { };
	this.ingest._raw = message;
	this._sqsToJson();
	this.egest = { };
};

EventModel.prototype._sqsToJson = function () {
	try {
		this.ingest._asJson = JSON.parse(this.ingest._raw.Body);
		var message = new Buffer(this.ingest._asJson.message);
	
		// Avoid 'unexpected input' error when trying to convert an empty buffer to a string
		if (message.length > 0) {
			this.ingest._body = JSON.parse(message.toString('utf8'));
		} else {
			this.ingest._body = {};
		}

		this.ingest._bodyFlattened = flatten(this.ingest._body);
		this.ingest._headers = this.ingest._asJson.headers || {}; 
	} catch (err) {
		console.log(err);
		this.ingest._asJson = {} 
		this.ingest._body = {} 
		this.ingest._bodyFlattened = {} 
		this.ingest._headers = {} 
	}
}

EventModel.prototype.headers = function (val) {
	return (val) ? this.ingest._headers[val] : this.ingest._headers;
}

EventModel.prototype.body = function (val) {
	return this.ingest._body[val];
}

EventModel.prototype.pluck = function (val) {
	return this.ingest._bodyFlattened[val];
}

EventModel.prototype.received = function (val) {
	return (this.ingest._asJson.time) ? this.ingest._asJson.time.received : undefined;
}

EventModel.prototype.annotate = function (key, val) {
	
	if (!this.egest.annotations) {
		this.egest.annotations = { };
	}

	return this.egest.annotations[key] = val;
}

EventModel.prototype.annotations = function () {
	return this.egest.annotations;
}

module.exports = EventModel;

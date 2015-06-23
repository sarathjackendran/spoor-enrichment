// Transpose the Ingest queue message in to a 'spoor meta data object' 

module.exports = function (event) {
	event.egest.spoor = {};
	event.egest.spoor.ingest = {};
	event.egest.spoor.ingest.raw = JSON.stringify(event.ingest);
	return event;
}

/*
 
   TODO ensure these are copied to egest
	MD5OfBody: message.MD5OfBody,
	ReceiptHandle: message.ReceiptHandle,
	MessageId: message.MessageId

*/


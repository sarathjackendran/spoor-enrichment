module.exports = function (message) {
	return new Promise(function(resolve, reject) {
		// if message contains a user.session then validate it
		resolve({
			MD5OfBody: message.MD5OfBody,
			ReceiptHandle: message.ReceiptHandle,
			MessageId: data.MessageId
		});
	});
}


module.exports = function (data) {
	return !!(data && data.event && data.event.source && data.event.action);
}

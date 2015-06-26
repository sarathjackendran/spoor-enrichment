
module.exports = function (event) {
	
	var hasCategory = !!event.pluck('category');
	var hasAction	= !!event.pluck('action');
	var hasSource	= !!event.pluck('system.source');

	var isValid = hasCategory && hasAction && hasSource;

	event.annotate('validation', {
		isValid: isValid,
		hasCategory: hasCategory,
		hasAction: hasAction,
		hasSource: hasSource
	});
	return event;

}


var metrics		= require('next-metrics')

module.exports = (event) => {
	
	return new Promise((resolve, reject) => {
	
		var hasCategory = !!event.pluck('category');
		var hasAction	= !!event.pluck('action');
		var hasSource	= !!event.pluck('system.source');

		var isValid = hasCategory && hasAction && hasSource;

		if (hasSource) {
			var source = event.pluck('system.source');
			metrics.count('pipeline.source.' + source, 1);
		}

		if (isValid) {
			metrics.count('pipeline.filters.isValidSource.isValid.true', 1);
		} else {
			metrics.count('pipeline.filters.isValidSource.isValid.false', 1);
		}
		
		if (hasCategory) {
			metrics.count('pipeline.filters.isValidSource.hasCategory.true', 1);
		} else {
			metrics.count('pipeline.filters.isValidSource.hasCategory.false', 1);
		}
		
		if (hasAction) {
			metrics.count('pipeline.filters.isValidSource.hasAction.true', 1);
		} else {
			metrics.count('pipeline.filters.isValidSource.hasAction.false', 1);
		}

		if (hasSource) {
			metrics.count('pipeline.filters.isValidSource.hasSource.true', 1);
		} else {
			metrics.count('pipeline.filters.isValidSource.hasSource.false', 1);
		}

		resolve({
			isValid: isValid,
			hasCategory: hasCategory,
			hasAction: hasAction,
			hasSource: hasSource
		});
	})
}

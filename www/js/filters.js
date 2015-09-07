angular.module('app.filters', [])

	.filter('translate', function(LanguageResource){
		
		var translateFilter = function(keyword){
			
			return LanguageResource.translateKeyword(keyword);
		};
		translateFilter.$stateful = true;
		
		return translateFilter;
	})
	
	.filter('range', function() {
		
		return function(array, length) {
			
			length = parseInt(length);
			for (var i = 0; i < length; i++)
				array.push(i);
			
			return array;
		};
	})
;
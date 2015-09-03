angular.module('app.filters', [])

	.filter('translate', function(LanguageResource){
		
		var translateFilter = function(keyword){
			
			return LanguageResource.translateKeyword(keyword);
		};
		translateFilter.$stateful = true;
		
		return translateFilter;
	})
;
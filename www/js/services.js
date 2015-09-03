angular.module('app.services', ['ngResource'])

	.factory('QuestionResource', ['$resource', function($resource) {

		'use strict';
		//http://golficon.boolex.com/public/ajax/questions
		//http://localhost/golfApp/public/ajax/questions
		return $resource('http://golficon.boolex.com/public/ajax/questions', {}, {
			questions: {
				method: 'GET',
				url: 'http://golficon.boolex.com/public/ajax/questions',
				isArray: true
			}
		});

	}])
	
	.factory('LanguageResource', function($http){
		
		var languageList = [
			{
				name: 'da',
				full_name: 'danish'
			},
			{
				name: 'en',
				full_name: 'english'
			}
		];
		var currentLanguage = languageList[0];
		var languageDictionary = null;
		
		var loadLanguage = function(language){
			
			$http.get('translations/' + currentLanguage.name + '.json')
			.then(function(response) {
				
				languageDictionary = response.data;
			});
		}
		
		loadLanguage(currentLanguage);
		return {
			translateKeyword: function(keyword){
				
				if(languageDictionary == null || languageDictionary[keyword] == null)
					return keyword;
				
				return languageDictionary[keyword];
			},
			getLanguageDictionary: function(){
				
				return languageDictionary;
			},
			getCurrentLanguage: function(){
				
				return currentLanguage;
			},
			setCurrentLanguage: function(language){
				
				currentLanguage = language;
				loadLanguage(currentLanguage);
			},
			getSupportedLanguages: function(){
				
				return languageList;
			}
		};
	})
	
	.factory('StorageResource', ['$window', function($window) {
		
		return {
			set: function(key, value) {
				
				$window.localStorage[key] = value;
			},
			get: function(key, defaultValue) {
				
				return $window.localStorage[key] != null ? $window.localStorage[key] : defaultValue;
			},
			setObject: function(key, value) {
				
				$window.localStorage[key] = JSON.stringify(value);
			},
			getObject: function(key, defaultValue) {
				
				return $window.localStorage[key] != null ? JSON.parse($window.localStorage[key]) : defaultValue;
			}
		};
	}])
	
	.factory('GameResource', function() {

		'use strict';
		
		var currentTotalScore = 0;
		
		return {
			getCurrentTotalScore: function(){
				
				return currentTotalScore;
			},
			setCurrentTotalScore: function(totalScore){
				
				currentTotalScore = totalScore;
			},
			resetScore: function(){
				
				currentTotalScore = 0;
			}
		};

	})
	
	.factory('ProfileResource', function() {

		'use strict';
		
		var profile = null;
		
		return {
			getProfile: function(){
				
				return profile;
			},
			setProfile: function(newProfile){
				
				profile = newProfile;
			},
			newProfile: function(name, email, password){
				
				profile = {
					name: name,
					email: email,
					password: password,
					ranking: 0,
					rounds: 0
				};
			}
		};

	})
;
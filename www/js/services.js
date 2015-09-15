angular.module('app.services', ['ngResource'])

	.constant('API_SERVER', 'http://golficon.boolex.com/')
	//.constant('API_SERVER', 'http://localhost/golfApp/')
	
	.factory('QuestionResource', ['$resource', 'API_SERVER', 
		function($resource, API_SERVER) {

		return $resource(API_SERVER + 'public/ajax/questions', {}, {
			questions: {
				method: 'GET',
				url: API_SERVER + 'public/ajax/questions',
				isArray: true
			}
		});
	}])
	
	.factory('MessageResource', ['$resource', 'API_SERVER', 
		function($resource, API_SERVER) {

		return $resource(API_SERVER + 'public/ajax/send-message', {}, {
			send: {
				method: 'POST',
				url: API_SERVER + 'public/ajax/send-message'
			}
		});
	}])
	
	.factory('PlayerResource', ['$resource', 'API_SERVER', 
		function($resource, API_SERVER) {

		return $resource(API_SERVER + 'public/ajax/save-player', {}, {
			save: {
				method: 'POST',
				url: API_SERVER + 'public/ajax/save-player'
			}
		});
	}])
	
	.factory('FriendsResource', ['$http', 
		function($http){
			
		var friends = [
			{
				thisMonth: 2,
				lastMonth: 2,
				name: 'Linda Gildberg',
				rounds: 32,
				score: 8
			},
			{
				thisMonth: 2,
				lastMonth: 4,
				name: 'Jesper Holme',
				rounds: 31,
				score: 12
			},
			{
				thisMonth: 3,
				lastMonth: 2,
				name: 'Ole Hansen',
				rounds: 32,
				score: 14
			}
		];
		
		return {
			getFriends: function(){
				
				return friends;
			}
		};
	}])
	
	.factory('LanguageResource', ['$http',
		function($http){
		
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
	}])
	
	.factory('StorageResource', ['$window', 
		function($window) {
		
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
	
	.factory('GameResource', 
		function() {

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
	
	.factory('ProfileResource', 
		function() {

		//var profile = null;
		
		return {
			data: {
				profile: null
			},
			getProfile: function(){
				
				return this.data.profile;
			},
			setProfile: function(newProfile){
				
				this.data.profile = newProfile;
			},
			newProfile: function(name, email, password){
				
				this.data.profile = {
					name: name,
					email: email,
					password: password,
					ranking: 0,
					rounds: 0,
					accessToken: false
				};
			}
		};

	})
;
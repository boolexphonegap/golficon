angular.module('app.services', ['ngResource'])

	.constant('API_SERVER', 'http://golficon.boolex.com/public/ajax/')
	//.constant('API_SERVER', 'http://localhost/golfApp/public/ajax/')
	
	.factory('APIResource', ['$resource', 'API_SERVER', 
		function($resource, API_SERVER) {

		return $resource(API_SERVER, {}, {
			getQuestions: {
				url: API_SERVER + 'questions',
				method: 'GET',
				isArray: true
			},
			getFriends: {
				url: API_SERVER + 'friends',
				method: 'GET',
				isArray: true
			},
			sendMessage: {
				method: 'POST',
				url: API_SERVER + 'send-message'
			},
			savePlayer: {
				method: 'POST',
				url: API_SERVER + 'save-player'
			},
			inviteViaEmail: {
				method: 'POST',
				url: API_SERVER + 'invite-via-email'
			},
			saveGame: {
				method: 'POST',
				url: API_SERVER + 'save-game'
			},
			inviteFriends: {
				method: 'POST',
				url: API_SERVER + 'invite-friends'
			},
			getChallenges: {
				method: 'GET',
				url: API_SERVER + 'challenges',
				isArray: true
			}
		});
	}])
	
	.factory('FriendsResource', ['APIResource', 'ProfileResource', 
		function(APIResource, ProfileResource){
			
		var friends = new Array();
		
		var refresh = function(){
			
			APIResource.getFriends({ id: ProfileResource.data.profile.id }).$promise
			.then(function(result){
				
				friends.length = 0;
				angular.forEach(result, function(item) {
					
					friends.push(item.friend);
				});
			});
		}
		
		if(ProfileResource.data.profile)
		{
			refresh();
		}
		
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
		var currentParentGameID = 0;
		var currentGame = null;
		var currentQuestionIDList = "";
		
		return {
			getCurrentParentGameID: function(){
				
				return currentParentGameID;
			},
			setCurrentParentGameID: function(parentGameID){
				
				currentParentGameID = parentGameID;
			},
			getCurrentQuestionIDList: function(){
				
				return currentQuestionIDList;
			},
			setCurrentQuestionIDList: function(questionIDList){
				
				currentQuestionIDList = questionIDList;
			},
			getCurrentTotalScore: function(){
				
				return currentTotalScore;
			},
			setCurrentTotalScore: function(totalScore){
				
				currentTotalScore = totalScore;
			},
			getCurrentGame: function(){
				
				return currentGame;
			},
			setCurrentGame: function(game){
				
				currentGame = game;
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
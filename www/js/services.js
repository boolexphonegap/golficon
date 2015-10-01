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
			},
			getTopPlayers: {
				method: 'GET',
				url: API_SERVER + 'top-players',
				isArray: true
			},
			getRank: {
				method: 'GET',
				url: API_SERVER + 'rank'
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
			},
			refresh: refresh
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
	
	.factory('HandicapResource', 
		function(){
			
		var scoreMatrix = {
			'50-54': {
				'50-54': 0,
				'45-49.9': -0.5,
				'40-44.9': -1,
				'35-39.9': -1,
				'31-34.9': -1,
				'27-30.9': -2,
				'24-26.9': -2,
				'21-23.9': -3,
				'18-20.9': -3,
				'16-17.9': -4,
				'14-15.9': -4,
				'12-13.9': -5,
				'10-11.9': -5,
				'8-9.9': -6,
				'6-7.9': -6,
				'4-5.9': -7,
				'0-3.9': -7
			},
			'44-49.9': {
				'50-54': 0.1,
				'45-49.9': 0,
				'40-44.9': 0,
				'35-39.9': -0.5,
				'31-34.9': -1,
				'27-30.9': -1,
				'24-26.9': -1,
				'21-23.9': -2,
				'18-20.9': -2,
				'16-17.9': -3,
				'14-15.9': -3,
				'12-13.9': -4,
				'10-11.9': -4,
				'8-9.9': -5,
				'6-7.9': -5,
				'4-5.9': -6,
				'0-3.9': -6
			},
			'40-43.9': {
				'50-54': 0.2,
				'45-49.9': 0.1,
				'40-44.9': 0,
				'35-39.9': -0.5,
				'31-34.9': -1,
				'27-30.9': -1,
				'24-26.9': -1,
				'21-23.9': -1,
				'18-20.9': -1,
				'16-17.9': -2,
				'14-15.9': -2,
				'12-13.9': -3,
				'10-11.9': -3,
				'8-9.9': -4,
				'6-7.9': -4,
				'4-5.9': -5,
				'0-3.9': -5
			},
			'36-39.9': {
				'50-54': 0.3,
				'45-49.9': 0.2,
				'40-44.9': 0.1,
				'35-39.9': 0,
				'31-34.9': -0.5,
				'27-30.9': -1,
				'24-26.9': -1,
				'21-23.9': -1,
				'18-20.9': -1,
				'16-17.9': -2,
				'14-15.9': -2,
				'12-13.9': -3,
				'10-11.9': -3,
				'8-9.9': -4,
				'6-7.9': -4,
				'4-5.9': -5,
				'0-3.9': -5
			},
			'33-35.9': {
				'50-54': 0.4,
				'45-49.9': 0.3,
				'40-44.9': 0.2,
				'35-39.9': 0.1,
				'31-34.9': 0,
				'27-30.9': -0.5,
				'24-26.9': -1,
				'21-23.9': -1,
				'18-20.9': -1,
				'16-17.9': -1,
				'14-15.9': -1,
				'12-13.9': -2,
				'10-11.9': -2,
				'8-9.9': -3,
				'6-7.9': -3,
				'4-5.9': -4,
				'0-3.9': -4
			},
			'30-32.9': {
				'50-54': 0.4,
				'45-49.9': 0.3,
				'40-44.9': 0.2,
				'35-39.9': 0.1,
				'31-34.9': 0,
				'27-30.9': -0.5,
				'24-26.9': -1,
				'21-23.9': -1,
				'18-20.9': -1,
				'16-17.9': -1,
				'14-15.9': -1,
				'12-13.9': -1,
				'10-11.9': -1,
				'8-9.9': -2,
				'6-7.9': -2,
				'4-5.9': -3,
				'0-3.9': -3
			},
			'25-29.9': {
				'50-54': 0.5,
				'45-49.9': 0.4,
				'40-44.9': 0.3,
				'35-39.9': 0.2,
				'31-34.9': 0.1,
				'27-30.9': 0,
				'24-26.9': 0,
				'21-23.9': -0.5,
				'18-20.9': -0.5,
				'16-17.9': -1,
				'14-15.9': -1,
				'12-13.9': -1,
				'10-11.9': -1,
				'8-9.9': -1,
				'6-7.9': -1,
				'4-5.9': -2,
				'0-3.9': -2
			},
			'20-24.9': {
				'50-54': 0.5,
				'45-49.9': 0.4,
				'40-44.9': 0.3,
				'35-39.9': 0.2,
				'31-34.9': 0.1,
				'27-30.9': 0,
				'24-26.9': 0,
				'21-23.9': 0,
				'18-20.9': -0.1,
				'16-17.9': -0.3,
				'14-15.9': -0.4,
				'12-13.9': -0.5,
				'10-11.9': -0.6,
				'8-9.9': -0.7,
				'6-7.9': -0.8,
				'4-5.9': -0.9,
				'0-3.9': -1
			},
			'10-19.9': {
				'50-54': 0.8,
				'45-49.9': 0.7,
				'40-44.9': 0.6,
				'35-39.9': 0.5,
				'31-34.9': 0.4,
				'27-30.9': 0.3,
				'24-26.9': 0.2,
				'21-23.9': 0.1,
				'18-20.9': 0,
				'16-17.9': 0,
				'14-15.9': 0,
				'12-13.9': 0,
				'10-11.9': 0,
				'8-9.9': -0.2,
				'6-7.9': -0.3,
				'4-5.9': -0.4,
				'0-3.9': -0.5
			},
			'0-9.9': {
				'50-54': 1.3,
				'45-49.9': 1.2,
				'40-44.9': 1.1,
				'35-39.9': 1.0,
				'31-34.9': 0.9,
				'27-30.9': 0.8,
				'24-26.9': 0.7,
				'21-23.9': 0.6,
				'18-20.9': 0.5,
				'16-17.9': 0.4,
				'14-15.9': 0.3,
				'12-13.9': 0.2,
				'10-11.9': 0.1,
				'8-9.9': -0,
				'6-7.9': -0.1,
				'4-5.9': -0.1,
				'0-3.9': -0.1
			}
		};
		
		var numberBelongsToRangeString = function(number, range_string)
		{
			var temp_arr = range_string.split('-');
			var lowest = parseFloat(temp_arr[0]);
			var highest = parseFloat(temp_arr[1]);
			if(number >= lowest && number <= highest)
			{
				return true;
			}
			
			return false;
		};
		
		return {
			getScoreIncrement: function(totalScore, handicap)
			{
				for(handicapRangeString in scoreMatrix)
				{
					if(numberBelongsToRangeString(handicap, handicapRangeString))
					{
						for(totalRangeString in scoreMatrix[handicapRangeString])
						{
							if(numberBelongsToRangeString(totalScore, totalRangeString))
							{
								return scoreMatrix[handicapRangeString][totalRangeString];
							}
						}
					}
				}
				
				return 0;
			}
		};
	})
	
	.factory('AdsResource', ['$http', '$sce', '$rootScope', '$ionicModal', '$window', 'API_SERVER', 
		function($http, $sce, $rootScope, $ionicModal, $window, API_SERVER) {
		
		var BANNER_ID_TOP = 1;
		var BANNER_ID_QUESTION = 2;
		
		var topBanner = '';
		var questionBanners = new Array();
		
		var getBanners = function(bannerID, attachFunction){
			
			$http.get(API_SERVER + 'ads/' + bannerID)
			.then(function(result) {
				
				attachFunction(result.data);
			});
		};
		
		var refresh = function(){
			
			getBanners(BANNER_ID_TOP, function(html){
				
				topBanner = $sce.trustAsHtml(html);
			});
			
			for(i = 0; i < 4; i++){
				
				getBanners(BANNER_ID_QUESTION, function(html){
					
					questionBanners.push($sce.trustAsHtml(html));
				});
			}
		};
		refresh();
		
		/*
		var $scope = $rootScope.$new();
		var adsModal = null;
		$ionicModal.fromTemplateUrl('view-ad.html', {
			scope: $scope
		})
		.then(function(modal) {
			
			adsModal = modal;
		});

		var showAd = function(){
			
			adsModal.show();
			angular.element(document.getElementsByName('view-ad-frame')).css({
				'width' :$window.innerWidth,
				'height' :$window.innerHeight,
			});
		};
		
		var closeAd = function(){
			
			adsModal.hide();
		};
		$scope.closeAd = closeAd;
		*/
		
		return {
			getTopBanner: function(){
				
				return topBanner;
			},
			getQuestionBanners: function(){
				
				return questionBanners;
			},
			refresh: refresh
			//showAd: showAd,
			//closeAd: closeAd
		};
	}])
;
angular.module('app', ['ionic', 'ngResource'])

    .config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider

            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/layout.html'
            })

            .state('app.start-screen', {
                url: '/start-screen',
                templateUrl: 'templates/start/index.html',
                controller: 'DefaultController'
            })

            .state('app.how-to-play', {
                url: '/how-to-play',
                controller: 'SlideController',
                templateUrl: 'templates/start/how-to-play.html'
            })

            .state('app.start-game', {
                url: '/start-game',
                controller: 'GameCtrl',
                templateUrl: 'templates/start/game.html'
            })

            .state('app.score-card', {
                url: '/score-card',
                templateUrl: 'templates/start/score.html'
            })

            .state('app.final-score', {
                url: '/final-score/:finalScore',
                controller: 'FinalScoreCtrl',
                templateUrl: 'templates/start/final-score.html'
            })

            .state('app.invite-friends', {
                url: '/invite-friends',
                templateUrl: 'templates/start/invite-friends.html'
            })

            .state('app.profile', {
                url: '/profile',
                templateUrl: 'templates/profile.html'
            })

            .state('app.rank-lists', {
                url: '/rank-lists',
                templateUrl: 'templates/rank-list.html'
            })

            .state('app.about-app', {
                url: '/about-app',
                templateUrl: 'templates/about-app.html'
            })

            .state('app.golf-regulation-handicap', {
                url: '/golf-regulation-handicap',
                templateUrl: 'templates/golf-regulation-handicap.html'
            })

            .state('app.sponsors', {
                url: '/sponsors',
            })

            .state('app.cooperation-with-dbu', {
                url: '/cooperation-with-dbu',
            })

            .state('app.credits', {
                url: '/credits',
            })

            .state('app.login', {
                url: '/login',
                templateUrl: 'templates/login.html',
            })

            .state('app.login-facebook', {
                url: '/login-facebook',
                templateUrl: 'templates/login-facebook.html',
            })

            .state('app.login-register', {
                url: '/login-register',
                templateUrl: 'templates/login-register.html',
            })
        ;

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('app/start-screen');
    })
	
	.factory('QuestionResource', ['$resource', function($resource) {

		'use strict';
		
		return $resource('http://golficon.boolex.com/public/ajax/questions', {}, {
			questions: {
				method: 'GET',
				url: 'http://golficon.boolex.com/public/ajax/questions',
				isArray: true
			}
		});

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
	
	.factory('LanguageResource', function($http){
		
		var languageList = [
			{
				name: 'da',
				full_name: 'danish'
			}
		];
		var currentLanguage = languageList[0];
		var languageDictionary = null;
		
		var loadLanguage = function(language){
			
			$http.get('translations/' + currentLanguage.name + '.json').then(function(response) {
				
				languageDictionary = response.data;
				console.log(languageDictionary);
			});
		}
		
		loadLanguage(currentLanguage);
		return {
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
	
	.controller('DefaultController', function($rootScope, LanguageResource){
		
		$rootScope.languageDictionary = LanguageResource.getLanguageDictionary();
	})
	
    .controller('GameCtrl', function ($scope, $state, $ionicBackdrop, $ionicPopup, QuestionResource, GameResource) {
        
		$scope.choosen = '';
        $scope.answer = '';
        $scope.questionIndex = 0;
        $scope.toggleScoreCard = false;
		
		$scope.questions = new Array();
		
		$ionicBackdrop.retain();
		QuestionResource.questions().$promise
		.then(
			function(result){
				$scope.questions = result;
				$ionicBackdrop.release();
			}, 
			function(error){
				
				$ionicBackdrop.release();
				
				var errorPopup = $ionicPopup.alert({
					title: 'Error!',
					template: 'An error occured during retrieving questions! Please try again later...'
				});
				
				errorPopup.then(function(){
					
					$state.go('app.start-screen');
				});
			}
		);
		
		$scope.answers = new Array();
		
        $scope.chooseLevel = function (level) {
            $scope.choosen = level;
        };

        $scope.chooseAnswer = function (answer) {
            $scope.answer = answer;
        };
		
		$scope.viewScoreChart = function(){
		
			var points = 0;
			if($scope.answer == "correct")
			{
				if($scope.choosen == "birdie")
				{
					points = 1;
				}
				else if($scope.choosen == "eagle")
				{
					points = 2;
				}
				else if($scope.choosen == "albatross")
				{
					points = 3;
				}
			}
		
			$scope.answers.push({
				difficulty: $scope.choosen,
				answer: $scope.answer,
				points: points,
				questionIndex: $scope.questionIndex
			});
			
			$scope.toggleScoreCard = true;
		}

        $scope.nextQuestion = function () {
			
			if($scope.questionIndex + 1 <= $scope.questions.length - 1)
			{
				$scope.questionIndex++;
					
				$scope.choosen = '';
				$scope.answer = '';
				
				$scope.toggleScoreCard = false;
			}
			else
			{
				var finalScore = 0;
				for(i in $scope.answers)
				{
					finalScore += $scope.answers[i].points;
				}
				GameResource.setCurrentTotalScore(finalScore);
				
				$state.go('app.final-score');
			}
        };
    })

    .controller('FinalScoreCtrl', function ($scope, $stateParams, GameResource, LanguageResource) {
		
        $scope.myActiveSlide = 1;
		$scope.finalScore = GameResource.getCurrentTotalScore();
		
        var registration_status = ['registered', 'non-registered'];
        var random = Math.floor((Math.random() * 2));
        $scope.status = registration_status[random];
    })

    .controller('SlideController', function ($scope) {

    })
;
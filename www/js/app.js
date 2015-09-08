﻿angular.module('app', ['ionic', 'ngCordova', 'app.controllers', 'app.services', 'app.filters'])

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
				controller : 'StartCtrl'
            })

            .state('app.how-to-play', {
                url: '/how-to-play',
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
                templateUrl: 'templates/profile.html',
				controller: 'ProfileCtrl'
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
                templateUrl: 'templates/credits.html',
				controller: 'CreditsCtrl'
            })

            .state('app.login', {
                url: '/login',
                templateUrl: 'templates/login.html',
				controller: 'LoginCtrl'
            })

            .state('app.login-facebook', {
                url: '/login-facebook',
                templateUrl: 'templates/login-facebook.html',
            })

            .state('app.login-register', {
                url: '/login-register',
                templateUrl: 'templates/login-register.html',
				controller: 'RegisterCtrl'
            })
			
            .state('app.dev-settings', {
                url: '/dev-settings',
                templateUrl: 'templates/dev-settings.html',
				controller: 'DevSettingsCtrl'
            })
        ;

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('app/start-screen');
    })
	
	.run(['StorageResource', 'LanguageResource', 'ProfileResource', function(StorageResource, LanguageResource, ProfileResource){
		
		ionic.Platform.ready(function(){
			
			//screen.lockOrientation('portrait');
			
			var savedLanguage = StorageResource.getObject('language', false);
			if(savedLanguage == false){
				
				StorageResource.setObject('language', LanguageResource.getCurrentLanguage());
			} else {
				
				LanguageResource.setCurrentLanguage(savedLanguage);
			}
			
			
			var profile = StorageResource.getObject('profile', false);
			if(profile != false){
				ProfileResource.data.profile = profile;
			}
		});
	}])
;
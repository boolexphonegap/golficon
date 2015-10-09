angular.module('app', ['ionic', 'ngCordova', 'ngIOS9UIWebViewPatch', 'app.controllers', 'app.services', 'app.filters'])

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
                url: '/start-game/:game_id',
                controller: 'GameCtrl',
                templateUrl: 'templates/start/game.html',
				params: {
					game_id: 0
				}
            })

            .state('app.final-score', {
                url: '/final-score/:finalScore',
                controller: 'FinalScoreCtrl',
                templateUrl: 'templates/start/final-score.html'
            })

            .state('app.invite-friends', {
                url: '/invite-friends/:game',
                templateUrl: 'templates/start/invite-friends.html',
				controller: 'InviteFriendsCtrl',
				params: {
					game: null
				}
            })

            .state('app.profile', {
                url: '/profile',
                templateUrl: 'templates/profile.html',
				controller: 'ProfileCtrl'
            })

            .state('app.rank-lists', {
                url: '/rank-lists',
                templateUrl: 'templates/rank-list.html',
				controller: 'RankListCtrl'
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
                url: '/login/:logout',
                templateUrl: 'templates/login.html',
				controller: 'LoginCtrl',
				params: {
					logout: false
				}
            })

            .state('app.contact', {
                url: '/contact-us/:type',
                templateUrl: 'templates/contact-us.html',
				controller: 'ContactUsCtrl',
				params: {
					type: 'contactUs'
				}
            })
			
            .state('app.my-challenges', {
                url: '/my-challenges',
                templateUrl: 'templates/my-challenges.html',
				controller: 'MyChallengesCtrl'
            })
			
            .state('app.logout', {
                url: '/logout',
                templateUrl: 'templates/logout.html',
				controller: 'LogoutCtrl'
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
	
	.run(['StorageResource', 'LanguageResource', 'ProfileResource', 'APIResource', 
		function(StorageResource, LanguageResource, ProfileResource, APIResource){
		
		ionic.Platform.ready(function(){
			
			var savedLanguage = StorageResource.getObject('language', false);
			if(savedLanguage == false || savedLanguage == null){
				
				StorageResource.setObject('language', LanguageResource.getCurrentLanguage());
			} else {
				
				LanguageResource.setCurrentLanguage(savedLanguage);
			}
			
			if(typeof LANGUAGE !== 'undefined'){
				
				var languages = LanguageResource.getSupportedLanguages();
				
				if(languages.length > LANGUAGE){
					
					var newLanguage = languages[LANGUAGE];
					
					LanguageResource.setCurrentLanguage(newLanguage);
					StorageResource.setObject('language', newLanguage)
				}
			}
			
			var profile = StorageResource.getObject('profile', false);
			if(profile != null && profile != false){
				
				if(profile.profileSaved == false){
					
					APIResource.savePlayer(profile).$promise
					.then(function(result){
						
						profile.profileSaved = true;
						StorageResource.setObject('profile', profile);
						ProfileResource.data.profile = profile;
					}, function(error){
						
						ProfileResource.data.profile = profile;
					});
				} else {
					
					ProfileResource.data.profile = profile;
				}
			}
			
			screen.lockOrientation('portrait');
		});
	}])
;
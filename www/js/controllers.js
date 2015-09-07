angular.module('app.controllers', ['ngCordova'])

	.controller('StartCtrl', ['$scope', 'StorageResource', 'LanguageResource', 
		function($scope, StorageResource, LanguageResource){
		
		$scope.changeLanguage = function(idx){
			
			var languages = LanguageResource.getSupportedLanguages();
			var daLanguages = languages[idx];
			
			LanguageResource.setCurrentLanguage(daLanguages);
			StorageResource.setObject('language', daLanguages)
		}
	}])
	
	.controller('DefaultCtrl', ['$scope', 'ProfileResource', 
		function($scope, ProfileResource){
		
		$scope.profile = function(){
			return ProfileResource.data.profile;
		};
	}])
	
    .controller('GameCtrl', ['$scope', '$state', '$ionicLoading', '$ionicPopup', 'QuestionResource', 'GameResource', 
		function ($scope, $state, $ionicLoading, $ionicPopup, QuestionResource, GameResource) {
        
		$scope.hints = 2;
		$scope.choosen = '';
        $scope.answer = '';
        $scope.questionIndex = 0;
        $scope.toggleScoreCard = false;
		$scope.questions = new Array();
		$scope.choices = new Array();
		$scope.adsPresent = 0;
		$scope.answers = new Array();
		
		var AVAILABLE_CHOICES = 4;
		
		$ionicLoading.show({
			template: 'Loading Questions...'
		});
		QuestionResource.questions().$promise
		.then(
			function(result){
				$scope.questions = result;
				
				$scope.choices.push($scope.questions[$scope.questionIndex].true_answer);
				$scope.choices.push($scope.questions[$scope.questionIndex].false_answer_1);
				$scope.choices.push($scope.questions[$scope.questionIndex].false_answer_2);
				$scope.choices.push($scope.questions[$scope.questionIndex].false_answer_3);
				
				$ionicLoading.hide();
			}, 
			function(error){
				
				$ionicLoading.hide();
				
				var errorPopup = $ionicPopup.alert({
					title: 'Error!',
					template: 'An error occured during retrieving questions! Please try again later...'
				});
				
				errorPopup.then(function(){
					
					$state.go('app.start-screen');
				});
			}
		);
		
		$scope.getBlankScoreCard = function(){
			
			return new Array();
		}
		
        $scope.chooseLevel = function (level) {
            $scope.choosen = level;
			
			if(level == 'birdie'){
				$scope.choices[2] = false;
				$scope.choices[3] = false;
				$scope.adsPresent = 2;
			} else if(level == 'eagle'){
				$scope.choices[3] = false;
				$scope.adsPresent = 1;
			}
        };

        $scope.chooseAnswer = function (answer) {
            $scope.answer = answer;
        };
		
		$scope.useHint = function(){
			
			if($scope.choosen != '' && $scope.answer == '')
			{
				if($scope.hints != 0 && $scope.adsPresent < 3)
				{
					$scope.hints--;
					$scope.adsPresent++;
					$scope.choices[AVAILABLE_CHOICES - $scope.adsPresent] = false;
				}
				else if($scope.adsPresent >= 3)
				{
					//TODO
				}
				else if($scope.hints == 0)
				{
					$ionicPopup.alert({
						title: 'Error!',
						template: 'You do not have available hints!'
					});
				}
			}
		}
		
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
			
			var outstandingPoints = 0;
			if($scope.answers.length == 0){
				outstandingPoints = 54 - points;
			} else {
				console.log($scope.answers[$scope.answers.length - 1]);
				console.log($scope.answers.length);
				outstandingPoints = $scope.answers[$scope.answers.length - 1].outstandingPoints - points;
			}
		
			$scope.answers.push({
				difficulty: $scope.choosen,
				answer: $scope.answer,
				points: points,
				outstandingPoints: outstandingPoints,
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
				$scope.adsPresent = 0;
				
				$scope.choices.length = 0;
				$scope.choices.push($scope.questions[$scope.questionIndex].true_answer);
				$scope.choices.push($scope.questions[$scope.questionIndex].false_answer_1);
				$scope.choices.push($scope.questions[$scope.questionIndex].false_answer_2);
				$scope.choices.push($scope.questions[$scope.questionIndex].false_answer_3);
				
				$scope.toggleScoreCard = false;
			}
			else
			{
				/* TODO: remove if unnecessary
				var finalScore = 54;
				for(i in $scope.answers)
				{
					finalScore -= $scope.answers[i].points;
				}
				*/
				GameResource.setCurrentTotalScore($scope.answers[$scope.answers.length - 1].outstandingPoints);
				
				$state.go('app.final-score');
			}
        };
    }])

    .controller('FinalScoreCtrl', ['$scope', '$stateParams', 'GameResource', 'LanguageResource', 'ProfileResource', 
		function ($scope, $stateParams, GameResource, LanguageResource, ProfileResource) {
		
		$scope.profile = function(){
			return ProfileResource.data.profile;
		};
        $scope.myActiveSlide = 1;
		$scope.finalScore = GameResource.getCurrentTotalScore();
		
        var random = Math.floor((Math.random() * 2));
        $scope.status = $scope.profile() != null ? 'registered' : 'non-registered';
    }])

    .controller('ProfileCtrl', ['$scope', '$state', 'StorageResource', 'ProfileResource', 
		function ($scope, $state, StorageResource, ProfileResource) {
		
		var profile = ProfileResource.data.profile;
		
		$scope.name = function(){
			return ProfileResource.data.profile.name;
		};
		
		$scope.email = function(){
			return ProfileResource.data.profile.email;
		};
		
		$scope.ranking = function(){
			return ProfileResource.data.profile.ranking;
		};
		
		$scope.rounds = function(){
			return ProfileResource.data.profile.rounds;
		};
    }])
	
	.controller('CreditsCtrl', ['$scope', '$cordovaInAppBrowser', 
		function($scope, $cordovaInAppBrowser){
		
		$scope.viewInBrowser = function(url){
			$cordovaInAppBrowser.open(url, '_system');
		}
	}])
	
	.controller('RegisterCtrl', ['$scope', '$ionicLoading', '$ionicPopup',
		function($scope, $ionicLoading, $ionicPopup){

		var self = this;
		
		$scope.registrationForm = {
			name: '',
			email: '',
			emailConfirm: '',
			password: '',
			passwordConfirm: '',
		};
		
		$scope.validateInput = function(){
			
			var hasErrors = false;
			
			if($scope.registrationForm.name.length == 0){
				hasErrors = true;
				$scope.nameError = true;
			} else {
				
				$scope.nameError = false;
			}
			if($scope.registrationForm.email.length == 0){
				hasErrors = true;
				$scope.emailError = true;
			} else {
				
				$scope.emailError = false;
			}
			if($scope.registrationForm.emailConfirm.length == 0 || $scope.registrationForm.emailConfirm != $scope.registrationForm.email){
				hasErrors = true;
				$scope.emailConfirmError = true;
			} else {
				
				$scope.emailConfirmError = false;
			}
			if($scope.registrationForm.password.length == 0){
				hasErrors = true
				$scope.passwordError = true;
			} else {
				
				$scope.passwordError = false;
			}
			if($scope.registrationForm.passwordConfirm.length == 0 || $scope.registrationForm.passwordConfirm != $scope.registrationForm.password){
				hasErrors = true;
				$scope.passwordConfirmError = true;
			} else {
				
				$scope.passwordConfirmError = false;
			}
			
			if(!hasErrors){
				
				$ionicPopup.alert({
					title: 'Success!',
					template: 'You are now registered to GolfQuis'
				});
			}
		}
	}])
	
	.controller('LoginCtrl', ['$scope', '$http', '$state', '$cordovaFacebook', '$ionicLoading', '$ionicPopup', 'StorageResource', 'ProfileResource',
		function($scope, $http, $state, $cordovaFacebook, $ionicLoading, $ionicPopup, StorageResource, ProfileResource){
		
		$scope.profile = function(){
			return ProfileResource.data.profile;
		}
		
		$scope.facebookLogin = function() {
				
			console.log('signing in');
			$ionicLoading.show({
				template: 'Signing in with facebook...'
			});
			$cordovaFacebook.login(["public_profile", "email", "user_friends"])
			.then(function(result) {
				
				$ionicLoading.hide();
				console.log('success');
				console.log(result);
				var accessToken = result.accessToken;
				
				$cordovaFacebook.api('me')
				.then(function(apiResult) {
				
					var facebookProfile = {
						name: apiResult.name,
						email: apiResult.email,
						password: 'facebook',
						ranking: 0,
						rounds: 0,
						accessToken: false
					};
					
					StorageResource.setObject('profile', facebookProfile);
					ProfileResource.data.profile = facebookProfile;
					
					var successPopup = $ionicPopup.alert({
						title: 'Success!',
						template: 'Welcome ' + apiResult.name
					});
					
					successPopup.then(function(){
						
						$state.go('app.start-screen');
					});
				}, function (error) {
					
					$ionicLoading.hide();
					
					var errorPopup = $ionicPopup.alert({
						title: 'Error!',
						template: 'An error occured during signing in to facebook! Please try again later...'
					});
					
					errorPopup.then(function(){
						
						$state.go('app.start-screen');
					});
				});
			}, function (error) {
				
				$ionicLoading.hide();
				
				var errorPopup = $ionicPopup.alert({
					title: 'Error!',
					template: 'An error occured during signing in to facebook! Please try again later...'
				});
				
				errorPopup.then(function(){
					
					$state.go('app.start-screen');
				});
			});
		};
	}])
;
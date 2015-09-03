angular.module('app.controllers', ['ngCordova'])

	.controller('StartCtrl', function($scope, StorageResource, LanguageResource){
		
		$scope.changeLanguage = function(idx){
			
			var languages = LanguageResource.getSupportedLanguages();
			var daLanguages = languages[idx];
			
			LanguageResource.setCurrentLanguage(daLanguages);
			StorageResource.setObject('language', daLanguages)
		}
	})
	
    .controller('GameCtrl', function ($scope, $state, $ionicLoading, $ionicPopup, QuestionResource, GameResource) {
        
		$scope.hints = 2;
		$scope.choosen = '';
        $scope.answer = '';
        $scope.questionIndex = 0;
        $scope.toggleScoreCard = false;
		$scope.questions = new Array();
		$scope.choices = new Array();
		$scope.adsPresent = 0;
		
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
		
		$scope.answers = new Array();
		
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

    .controller('FinalScoreCtrl', function ($scope, $stateParams, GameResource, LanguageResource, ProfileResource) {
		
		$scope.profile = ProfileResource.getProfile();
        $scope.myActiveSlide = 1;
		$scope.finalScore = GameResource.getCurrentTotalScore();
		
        var random = Math.floor((Math.random() * 2));
        $scope.status = $scope.profile != null ? 'registered' : 'non-registered';
    })

    .controller('ProfileCtrl', function ($scope, $state, StorageResource, ProfileResource) {
		
		var profile = ProfileResource.getProfile();
		
		$scope.name = profile.name;
		$scope.email = profile.name;
		$scope.ranking = profile.name;
		$scope.rounds = profile.name;
    })
	
	.controller('DefaultCtrl', function($scope, ProfileResource){
		
		$scope.profile = ProfileResource.getProfile();
		$scope.pusheen = 'the cat';
	})
	
	.controller('CreditsCtrl', function($scope, $cordovaInAppBrowser){
		
		$scope.viewInBrowser = function(url){
			$cordovaInAppBrowser.open(url, '_blank');
		}
	})
	
	.controller('Register', function($scope){
		
		$scope.validateInput = function(){
			
			var hasErrors = false;
			
			if($scope.name.length == 0){
				hasErrors = true;
			}
			if($scope.email.length == 0){
				hasErrors = true;
			}
			if($scope.emailConfirm.length == 0){
				hasErrors = true;
			}
			if($scope.password.length == 0){
				hasErrors = true;
			}
			if($scope.passwordConfirm.length == 0){
				hasErrors = true;
			}
			
			if(hasErrors){
				
			}
		}
	})
;
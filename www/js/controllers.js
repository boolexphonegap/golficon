angular.module('app.controllers', ['ngCordova', 'app.filters'])

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
	
    .controller('GameCtrl', ['$scope', '$state', '$stateParams', '$ionicLoading', '$ionicPopup', 'APIResource', 'GameResource', 'translateFilter', 
		function ($scope, $state, $stateParams, $ionicLoading, $ionicPopup, APIResource, GameResource, translateFilter) {
        
		$scope.parentGameID = $stateParams.game_id;
		$scope.hints = 2;
		$scope.choosen = '';
        $scope.answer = '';
        $scope.questionIndex = 0;
        $scope.toggleScoreCard = false;
		$scope.questions = new Array();
		$scope.choices = new Array();
		$scope.adsPresent = 0;
		$scope.answers = new Array();
		$scope.questionIDList = new Array();
		
		var AVAILABLE_CHOICES = 4;
		
		$ionicLoading.show({
			template: translateFilter('LOADING_QUESTIONS')
		});
		APIResource.getQuestions({
			game_id: $scope.parentGameID
		}).$promise
		.then(
			function(result){
				//$scope.questions = result;
				$scope.questions.push(result[0]);
				$scope.questions.push(result[1]);
				
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
					template: translateFilter('ERROR_QUESTION_LOADING')
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
						template: translateFilter('ERROR_NO_HINTS')
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
				outstandingPoints = $scope.answers[$scope.answers.length - 1].outstandingPoints - points;
			}
		
			$scope.answers.push({
				difficulty: $scope.choosen,
				answer: $scope.answer,
				points: points,
				outstandingPoints: outstandingPoints,
				questionIndex: $scope.questionIndex
			});
			
			$scope.questionIDList.push($scope.questions[$scope.questionIndex].id);
			
			$scope.toggleScoreCard = true;
		}

        $scope.nextQuestion = function () {
			
			if($scope.questionIndex + 1 <= $scope.questions.length - 1)
			{
				$scope.questionIndex++;
				
				if(!$scope.questions[$scope.questionIndex])
				{
					GameResource.setCurrentTotalScore($scope.answers[$scope.answers.length - 1].outstandingPoints);
					
					$state.go('app.final-score');
					
					return;
				}
					
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
				var questionIDList = $scope.questionIDList.join();
				GameResource.setCurrentQuestionIDList(questionIDList);
				
				GameResource.setCurrentParentGameID($scope.parentGameID);
				
				GameResource.setCurrentTotalScore($scope.answers[$scope.answers.length - 1].outstandingPoints);
				
				$state.go('app.final-score');
			}
        };
    }])

    .controller('FinalScoreCtrl', ['$scope', '$state', '$ionicPopup', 'GameResource', 'LanguageResource', 'ProfileResource', 'APIResource', 'StorageResource', 'translateFilter',
		function ($scope, $state, $ionicPopup, GameResource, LanguageResource, ProfileResource, APIResource, StorageResource, translateFilter) {
		
		var profile = ProfileResource.data.profile;
		
        $scope.myActiveSlide = 1;
		$scope.finalScore = GameResource.getCurrentTotalScore();
		$scope.questionIDList = GameResource.getCurrentQuestionIDList();
		$scope.parentGameID = GameResource.getCurrentParentGameID();
		
        var random = Math.floor((Math.random() * 2));
        $scope.status = profile != null ? 'registered' : 'non-registered';
		
		$scope.game = null;
		if(profile != null)
		{
			APIResource.saveGame({
				id: profile.id,
				total_score: $scope.finalScore,
				question_id_list: $scope.questionIDList,
				parent_game_id: $scope.parentGameID
			}).$promise
			.then(function(result){
				
				ProfileResource.data.profile.score = result.score;
				ProfileResource.data.profile.rounds = result.rounds;
				StorageResource.setObject('profile', ProfileResource.data.profile);
				
				
				$scope.game = result.game;
				GameResource.setCurrentGame(result.game);
			}, function(error){
				
				var unsavedGames = StorageResource.getObject('unsavedGames', []);
				unsavedGames.push($scope.finalScore);
				StorageResource.setObject('unsavedGames', unsavedGames);
				GameResource.resetGame();
			});
		}
		else
		{
			var unsavedGames = StorageResource.getObject('unsavedGames', []);
			unsavedGames.push($scope.finalScore);
			StorageResource.setObject('unsavedGames', unsavedGames);
		}
		
		$scope.inviteFriends = function(){
			
			if($scope.game != null){
				
				$state.go('app.invite-friends');
			} else {
				
				var errorPopup = $ionicPopup.alert({
					title: 'Error!',
					template: translateFilter('REQUIRE_SIGN_IN')
				});
				errorPopup.then(function(){
					
					$state.go('app.login');
				});
			}
		}
    }])

    .controller('ProfileCtrl', ['$scope', '$state', 'StorageResource', 'ProfileResource', 'FriendsResource', 
		function ($scope, $state, StorageResource, ProfileResource, FriendsResource) {
		
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
		
		$scope.friends = FriendsResource.getFriends();
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
	
	.controller('LoginCtrl', ['$scope', '$http', '$state', '$cordovaOauth', '$ionicLoading', '$ionicPopup', 'StorageResource', 'ProfileResource', 'APIResource', 'translateFilter',
		function($scope, $http, $state, $cordovaOauth, $ionicLoading, $ionicPopup, StorageResource, ProfileResource, APIResource, translateFilter){
		
		
		$scope.registrationForm = {
			email: '',
			password: ''
		};
		
		$scope.saveProfile = function(name, email, password, accessToken){
			
			var newProfile = {
				id: 0,
				name: name,
				email: email,
				password: password,
				ranking: 0,
				rounds: 0,
				score: 54,
				accessToken: accessToken,
				profileSaved: false
			};
			
			APIResource.savePlayer(newProfile).$promise
			.then(function(saveResult){
				
				if(saveResult.statusCode == 1)
				{
					newProfile.id = saveResult.player.id;
					newProfile.name = saveResult.player.name;
					newProfile.email = saveResult.player.email;
					newProfile.password = saveResult.player.password;
					newProfile.rounds = saveResult.player.rounds;
					newProfile.score = saveResult.player.score;
					newProfile.profileSaved = true;

					$scope.setProfileToPhone(newProfile);
				}
				else
				{
					newProfile.id = saveResult.player.id;
					newProfile.profileSaved = true;
					$scope.setProfileToPhone(newProfile);
				}
			}, function(error){
				
				$scope.setProfileToPhone(newProfile);
			});
		};
		
		$scope.setProfileToPhone = function(profile){
			
			StorageResource.setObject('profile', profile);
			ProfileResource.data.profile = profile;
				
			var successPopup = $ionicPopup.alert({
				title: 'Success!',
				template: translateFilter('WELCOME') + " " + translateFilter('APP_NAME')
			});
			
			successPopup.then(function(){
				
				$state.go('app.start-screen');
			});
		};
		
		$scope.registerUser = function(frmEmailLogin){
			
			if(frmEmailLogin.email.$valid && frmEmailLogin.password.$valid){
				
				var nameInputPopup = $ionicPopup.prompt({
					title: translateFilter('ASK_NAME'),
					inputType: 'text',
					inputPlaceholder: 'Name'
				});
				
				nameInputPopup.then(function(input){
					
					$scope.saveProfile(input, $scope.registrationForm.email, $scope.registrationForm.password, false);
				});
			}
		};
		
		$scope.facebookLogin = function() {
			
			$ionicLoading.show({
				template: translateFilter('FACEBOOK_SIGN_IN')
			});
			$cordovaOauth.facebook("1642193092719323", ["email"])
			.then(function(result) {
				
				$ionicLoading.hide();
				var accessToken = result.access_token;
				
				$http.get("https://graph.facebook.com/v2.4/me", { 
					params: { 
						access_token: accessToken, 
						fields: "name,email", 
						format: "json" 
					}
				})
				.then(function(apiResult) {
				
					
					$scope.saveProfile(apiResult.data.name, apiResult.data.email, 'facebook', accessToken);
					
				}, function (error) {
					
					$ionicLoading.hide();
					
					var errorPopup = $ionicPopup.alert({
						title: 'Error!',
						template: translateFilter('ERROR_FACEBOOK_SIGN_IN')
					});
					
					errorPopup.then(function(){
						
						$state.go('app.start-screen');
					});
				});
			}, function (error) {
				
				$ionicLoading.hide();
				
				var errorPopup = $ionicPopup.alert({
					title: 'Error!',
					template: translateFilter('ERROR_FACEBOOK_SIGN_IN')
				});
				
				errorPopup.then(function(){
					
					$state.go('app.start-screen');
				});
			});
		};
	}])
	
	.controller('DevSettingsCtrl', ['$scope', '$ionicPopup', 'StorageResource', 'ProfileResource', 'translateFilter',
		function($scope, $ionicPopup, StorageResource, ProfileResource, translateFilter){
		
		$scope.viewProfile = function(){
			
			$ionicPopup.alert({
				title: 'Profile Information',
				template: JSON.stringify(ProfileResource.data.profile)
			});
		};
		
		$scope.removeProfile = function(){
			
			ProfileResource.data.profile = null;
			StorageResource.setObject('profile', null);
			
			$ionicPopup.alert({
				title: 'Profile Information',
				template: 'Profile successfully removed'
			});
		};
		
		$scope.setDummyProfile = function(){
			
			var dummyProfile = {
				name: 'Pusheen the Cat',
				email: 'pusheen@thecat.com',
				password: 'cat',
				ranking: 0,
				rounds: 0,
				accessToken: false
			};
			
			ProfileResource.data.profile = dummyProfile;
			StorageResource.setObject('profile', dummyProfile);
			
			$ionicPopup.alert({
				title: 'Profile Information',
				template: translateFilter('PROFILE_SAVED')
			});
		}
	}])
	
	.controller('RankListCtrl', ['$scope', 'FriendsResource', 
		function($scope, FriendsResource){
			
		$scope.rankInput = {
			ranking: "friends"
		};
		
		$scope.friends = FriendsResource.getFriends();
		
		$scope.all = new Array();
		
		$scope.list = new Array();
		
		$scope.changeList = function(){
			
			if($scope.rankInput.ranking == "friends"){
				$scope.list = $scope.friends;
			} else if($scope.rankInput.ranking == "all") {
				$scope.list = $scope.all;
			}
		};
		$scope.changeList();
	}])
	
	.controller('InviteFriendsCtrl', ['$scope', '$state', '$stateParams', '$ionicPopup', '$ionicLoading', 'FriendsResource', 'ProfileResource', 'GameResource', 'APIResource', 'translateFilter',
		function($scope, $state, $stateParams, $ionicPopup, $ionicLoading, FriendsResource, ProfileResource, GameResource, APIResource, translateFilter){
		
		$scope.game = GameResource.getCurrentGame();
		
		$scope.friends = FriendsResource.getFriends();
		for(i in $scope.friends){
			
			$scope.friends[i].include = false;
		}
		
		$scope.inviteForm = {
			email: ''
		};
		
		$scope.toggleCheckbox = function(index){
			
			$scope.friends[index].include = !$scope.friends[index].include;
		}
		
		$scope.inviteFriends = function(){
			
			var invitedFriends = new Array();
			for(i in $scope.friends){
				
				if($scope.friends[i].include == false)
					continue;
				
				invitedFriends.push($scope.friends[i].id);
			}
			
			if(invitedFriends.length > 0 && $scope.game != null){
				
				$ionicLoading.show();
				APIResource.inviteFriends({
					game_id: $scope.game.id,
					friends: invitedFriends
				}).$promise
				.then(function(result){
					
					$ionicLoading.hide();
					$ionicPopup.alert({
						title: 'Success!',
						template: translateFilter('FRIEND_INVITED')
					});
				}, function(){
					
					$ionicLoading.hide();
					$ionicPopup.alert({
						title: 'Error!',
						template: translateFilter('ERROR_FRIEND_INVITE')
					});
				});
			} else if (invitedFriends.length == 0){
				
				$ionicPopup.alert({
					title: 'Error!',
					template: translateFilter('ERROR_INVITE_FRIEND')
				});
			}
		}
		
		$scope.inviteViaEmail = function(frmInviteViaEmail){
			
			if(frmInviteViaEmail.email.$valid)
			{
				var profile = ProfileResource.data.profile;
				
				if(profile != null && $scope.game != null)
				{
					$ionicLoading.show();
					APIResource.inviteViaEmail({
						id: profile.id,
						game_id: $scope.game.id,
						friend_email: $scope.inviteForm.email
					}).$promise
					.then(function(result){
						
						$ionicLoading.hide();
						$ionicPopup.alert({
							title: 'Success!',
							template: translateFilter('FRIEND_INVITED')
						});
					}, function(error){
						
						$ionicLoading.hide();
						$ionicPopup.alert({
							title: 'Error!',
							template: translateFilter('ERROR_FRIEND_INVITE')
						});
					});
				}
				else
				{
					
					var errorPopup = $ionicPopup.alert({
						title: 'Error!',
						template: translateFilter('REQUIRE_SIGN_IN')
					});
					errorPopup.then(function(){
						
						$state.go('app.login');
					});
				}
				
			}
		}
	}])
	
	.controller('ContactUsCtrl', ['$scope', '$stateParams', '$ionicPopup', '$ionicLoading', 'ProfileResource', 'APIResource', 'translateFilter',
		function($scope, $stateParams, $ionicPopup, $ionicLoading, ProfileResource, APIResource, translateFilter){
			
		var profile = ProfileResource.data.profile;
			
		$scope.contactForm = {
			type: $stateParams.type,
			name: profile ? profile.name : '',
			email: profile ? profile.email : '',
			subject: '',
			message: ''
		};
		
		$scope.type = $stateParams.type;
		$scope.typeDisplayName = "";
			
		if($stateParams.type == "contactUs"){
			
			$scope.typeDisplayName = "Kontakt os";
			$scope.contactForm.subject = "Kontakt os : " + $scope.contactForm.name;
		}
		else if($stateParams.type == "feedback"){
			
			$scope.typeDisplayName = "Feedback";
			$scope.contactForm.subject = "Feedback : " + $scope.contactForm.name;
		}
		else if($stateParams.type == "beAdvertiser"){
			
			$scope.typeDisplayName = "Bliv annoncør";
			$scope.contactForm.subject = "Bliv annoncør : " + $scope.contactForm.name;
		}
		
		$scope.sendMessage = function(frmContactUs){
			
			if(frmContactUs.name.$valid && frmContactUs.email.$valid && frmContactUs.message.$valid){
				
				$ionicLoading.show();
				APIResource.sendMessage($scope.contactForm).$promise
				.then(function(result){
					
					$ionicLoading.hide();
					$ionicPopup.alert({
						title: 'Success!',
						template: translateFilter('MESSAGE_SENT')
					});
				}, function(error){
					
					$ionicLoading.hide();
					$ionicPopup.alert({
						title: 'Error!',
						template: translateFilter('ERROR_SEND_MESSAGE')
					});
				});
			}
		}
	}])
	
	.controller('MyChallengesCtrl', ['$scope', '$state', '$ionicPopup', '$ionicLoading', 'ProfileResource', 'APIResource', 'translateFilter',
		function($scope, $state, $ionicPopup, $ionicLoading, ProfileResource, APIResource, translateFilter){
		
		$scope.challenges = new Array();
		
		$ionicLoading.show({ template: 'Loading Challenges' });
		APIResource.getChallenges({
			id: ProfileResource.data.profile.id
		}).$promise
		.then(function(result){
			
			$scope.challenges = result;
			$ionicLoading.hide();
		}, function(error){
			
			$ionicLoading.hide();
		});
		
		$scope.toggleCheckbox = function(index){
			
			if($scope.challenges[index].status == 'INVITED'){
			
				$scope.challenges[index].status = 'ACCEPTED';
				
				$state.go('app.start-game', { game_id: $scope.challenges[index].game_id });
			}
		}
	}])
;
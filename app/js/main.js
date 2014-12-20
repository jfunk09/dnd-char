angular.module('lodashModule', [])
	.factory('_', ['$window', function ($window) {
		return $window._;
	}]);

angular.module('jqueryModule', [])
	.factory('$', ['$window', function ($window) {
		return $window.jQuery;
	}]);

var app = angular.module('dndCharApp', [
	'ui.router',
	'lodashModule',
	'jqueryModule'
]);

//===== STATE DEFINITIONS =====//

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
	var defaultUrl = '/app';

	$locationProvider.html5Mode(true);
	$locationProvider.hashPrefix('!');
	$urlRouterProvider.when('', defaultUrl);
	$urlRouterProvider.otherwise(defaultUrl);
	$stateProvider
		.state('root', {
			url: ''
		})
		.state('app', {
			url: defaultUrl,
			views: {
				'mainMenu': {
					templateUrl: 'partials/mainMenu.html',
					controller: 'mainMenuCtrl'
				},
				'content': {
					templateUrl: 'partials/homepage.html'
				}
			}
		})
		.state('app.characterList', {
			url: '/characters',
			views: {
				'content@': {
					templateUrl: 'partials/characterList.html',
					controller: 'characterListCtrl'
				}
			}
		})
		.state('app.characterPage', {
			url: '/character/:id',
			views: {
				'content@': {
					templateUrl: 'partials/characterPage.html',
					controller: 'characterPageCtrl'
				}
			}
		})
		.state('app.createCharacter', {
			url: '/createCharacter',
			views: {
				'content@': {
					templateUrl: 'partials/createCharacter.html',
					controller: 'addCtrl'
				}
			}
		});
}]);

//===== CONTROLLERS =====//

app.controller('mainMenuCtrl', ['$scope', '$state', '$rootScope', '_', function ($scope, $state, $rootScope, _) {
	$scope.menuTabs = [
		{number: 0, title: 'Home', state: 'app'},
		{number: 1, title: 'List', state: 'app.characterList'},
		{number: 2, title: 'Add Character', state: 'app.createCharacter'}
	];
	var initialTab = _.findWhere($scope.menuTabs, {state: $state.current.name});
	$scope.activeTab = initialTab ? initialTab.number : -1;

	$scope.goTo =function (tab) {
		$scope.activeTab = tab.number;
		$state.go(tab.state);
	};

	$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
		var newTab = _.findWhere($scope.menuTabs, {state: toState.name});
		$scope.activeTab = newTab ? newTab.number : -1;
	});
}]);

app.controller('characterListCtrl', ['$scope', 'characterService', '$state', '$q',
	function ($scope, characterService, $state) {
		$scope.characters = [];
		characterService.fetchCharacterList()
			.then(function (result) {
				$scope.characters = result.data;
			});

		$scope.goToCharacter = function (id) {
			$state.go('app.characterPage', {id: id});
		};
	}]);

app.controller('characterPageCtrl', ['$scope', '$stateParams', 'characterService',
	function ($scope, $stateParams, characterService) {
		$scope.character = {};
		characterService.fetchCharacter($stateParams.id)
			.then(function (result) {
				$scope.character = result.data;
			});

		$scope.$watch('character', function (character) {
			if (!character) { return; }
			characterService.updateCharacter($stateParams.id, character);
		}, true);
	}]);

app.controller('addCtrl', ['$scope', 'characterService',
	function ($scope, characterService) {
		$scope.name = null;
		$scope.race = null;
		$scope.charClass = null;

		$scope.addCharacter = function () {
			characterService.addCharacter({name: $scope.name, race: $scope.race, charClass: $scope.charClass})
				.then(function (data) {
					console.log('character added: ', data);
				});
		};
	}]);

//===== DIRECTIVES =====//

app.directive('editableField', ['$', '_', function ($, _) {
	return {
		restrict: 'E',
		scope: {
			fieldValue: '='
		},
		templateUrl: 'partials/editableField.html',
		link: function postLink($scope, element) {
			$scope.editMode = false;
			$scope.modField = {value: ''};
			$scope.editField = function () {
				$scope.editMode = true;
				$scope.modField.value = $scope.fieldValue;
				_.defer(function () {
					$(element).find('input').focus();
				}, 0);
			};
			$scope.update = function () {
				$scope.editMode = false;
				$scope.fieldValue = $scope.modField.value;
			};
			$scope.keyupHandler = function (event) {
				if(event.keyCode === 13) {
					$scope.update();
				}
			};
		}
	};
}]);

//===== SERVICES =====//

app.service('characterService', ['$http', '_', function ($http, _) {
	return {
		fetchCharacter: function (id) {
			return $http.get('/api/getCharacter?id=' + id);
		},
		fetchCharacterList: function () {
			return $http.get('/api/characters');
		},
		addCharacter: function (params) {
			return $http.post('/api/addCharacter', params);
		},
		updateCharacter: function (id, params) {
			var postParams = {dbID: id, params: params};
			return $http.post('/api/updateCharacter', postParams);
		}
	};
}]);
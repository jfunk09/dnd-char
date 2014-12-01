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

app.controller('characterListCtrl', ['$scope', '$http', '$state', function ($scope, $http, $state) {
	$http.get('/api/characters')
		.success(function (data) {
			console.log(data);
			$scope.characters = data;
		})
		.error(function (data) {
			console.log('error fetching characters');
		});
	$scope.goToCharacter = function (id) {
		$state.go('app.characterPage', {id: id});
	};
}]);

app.controller('characterPageCtrl', ['$scope', '$http', '$stateParams', function ($scope, $http, $stateParams) {
	$scope.character = {};
	$http.get('/api/getCharacter?id=' + $stateParams.id)
		.success(function (data) {
			$scope.character = data;
		})
		.error(function (data) {
			console.log('character fetch error');
		});
}]);

app.controller('addCtrl', ['$scope', '$http', function ($scope, $http) {
	$scope.name = null;
	$scope.race = null;
	$scope.charClass = null;

	$scope.addCharacter = function () {
		$http.post('/api/addCharacter', {name: $scope.name, race: $scope.race, charClass: $scope.charClass})
			.success(function (data) {
				console.log('character added: ', data);
			})
			.error(function (data) {
				console.log('error adding character');
			});
	};
}]);
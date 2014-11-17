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
					template: '<div>To be a main menu</div>'
				},
				'content': {
					template: '<div>Home page content</div>'
				}
			}
		})
		.state('app.test', {
			url: '/test',
			views: {
				'content@': {
					template: '<div>test</div>'
				}
			}
		})
		.state('app.characterList', {
			url: '/characters',
			views: {
				'content@': {
					templateUrl: 'partials/characterList.html',
					controller: 'MainCtrl'
				}
			}
		})
		.state('app.createCharacter', {
			url: '/createCharacter',
			views: {
				'content@': {
					templateUrl: 'partials/createCharacter.html',
					controller: 'AddCtrl'
				}
			}
		});
}]);

app.controller('MainCtrl', ['$scope', '$http', function ($scope, $http) {
		$http.get('/api/characters')
			.success(function (data) {
				console.log(data);
				$scope.characters = data;
			})
			.error(function (data) {
				console.log('error');
			});
	}]);

app.controller('AddCtrl', ['$scope', '$http', function ($scope, $http) {
		$scope.name = null;
		$scope.race = null;
		$scope.charClass = null;
		
		$scope.addCharacter = function () {
			$http.post('/api/addCharacter', {name: $scope.name, race: $scope.race, charClass: $scope.charClass})
				.success(function (data) {
			
				})
				.error(function (data) {
			
				});
		};
	}]);
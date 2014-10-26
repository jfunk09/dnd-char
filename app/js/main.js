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

angular.module('dndCharApp')
	.directive('main', [function () {
		return {
			restrict: 'E',
			controller: 'MainCtrl',
			template: '{{mfVar}}'
		};
	}]);

app.controller('MainCtrl', ['$scope', function ($scope) {
		$scope.mfVar = 'a scope variable';
	}]);
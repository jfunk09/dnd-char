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
				updatePage();
			});

		$scope.$watch('character', function (character) {
			if (!character) { return; }
			characterService.updateCharacter($stateParams.id, character);
			updatePage();
		}, true);

		function updatePage() {

		}
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

app.directive('healthDisplay', ['$', '_', '$location', function ($, _, $location) {
	return {
		restrict: 'E',
		scope: {
			health: '=',
			width: '@'
		},
		template: '',
		link: function postLink(scope, elements, attrs) {

			var width = _.parseInt(scope.width), height = 50, border = 8, buffer = 16, fontSize = 12;
			var wrapper = d3.select(elements[0])
				.append('svg')
				.classed('healthDisplay', true)
				.attr('width', width + 2*buffer)
				.attr('height', height + 2*buffer);
			var defs = wrapper.append('defs');
			var healthBarClip = 'health-clip-' + _.random(1,100000).toString(); // TODO: do this better with a service or something

			function render(maxHealth, currentHealth, tempHealth) {

				// Health Bar Clip
				var healthClip = defs.selectAll('#' + healthBarClip).data([currentHealth]);
				healthClip.enter()
					.append('clipPath')
					.attr('id', healthBarClip)
					.append('rect')
					.attr('width', (currentHealth / maxHealth) * width)
					.attr('height', height)
					.attr('x', buffer + border/2).attr('y', buffer + border/2);
				healthClip.transition()
					.select('rect')
					.attr('width', (currentHealth / maxHealth) * width);
				healthClip.exit().remove();

				// Health Bar
				var healthBarContainer = wrapper.selectAll('g.tempBar').data([tempHealth]);
				healthBarContainer.enter()
					.append('g')
					.classed('tempBar', true);
				healthBarContainer.exit().remove();

				var tempHealthBorder = healthBarContainer.selectAll('rect.border').data([tempHealth]);
				tempHealthBorder.enter()
					.append('rect')
					.classed('border', true)
					.attr('width', width + border)
					.attr('height', height + border)
					.attr('x', buffer).attr('y', buffer)
					.attr('rx', 5).attr('ry', 5)
					.attr('fill', 'none')
					.attr('stroke', '#5AA1BF')
					.attr('stroke-width', border);
				tempHealthBorder.transition()
					.attr('stroke-opacity', (tempHealth / maxHealth));
				tempHealthBorder.exit().remove();

				var healthFill = healthBarContainer.selectAll('rect.fill').data([tempHealth]);
				healthFill.enter()
					.append('rect')
					.classed('fill', true)
					.attr('clip-path', 'url(' + $location.absUrl() + '#' + healthBarClip + ')')
					.attr('width', width)
					.attr('height', height)
					.attr('x', buffer + border/2).attr('y', buffer + border/2)
					//.attr('rx', 5).attr('ry', 5)
					.attr('fill', 'red')
					.attr('stroke', 'darkgrey')
					.attr('stroke-widht', 1);
				healthFill.exit().remove();

				var healthOutline = healthBarContainer.selectAll('rect.outline').data([currentHealth]);
				healthOutline.enter()
					.append('rect')
					.classed('outline', true)
					.attr('width', width)
					.attr('height', height)
					.attr('x', buffer + border/2).attr('y', buffer + border/2)
					//.attr('rx', 5).attr('ry', 5)
					.attr('fill', 'none')
					.attr('stroke', 'darkgrey')
					.attr('stroke-widht', 1);
				healthOutline.exit().remove();

				var healthText = healthBarContainer.selectAll('text').data([maxHealth, currentHealth, tempHealth]);
				healthText.enter()
					.append('text')
					.attr('x', (width/2) + buffer + (border/2))
					.attr('y', (height/2) + buffer + (border/2) + (fontSize/2))
					.attr('text-anchor', 'middle');
				healthText.transition()
					.text('Health: ' + currentHealth.toString() +
						' / ' + maxHealth.toString() +
						' (' + tempHealth.toString() + ')');
				healthText.exit().remove();
			}

			scope.$watch('health', function (health) {
				if(health) {
					render(health.max, health.current, health.temp);
				}
			}, true);
		}
	}
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
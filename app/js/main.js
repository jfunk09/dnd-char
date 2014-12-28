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
			url: '/characterList',
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
		.state('app.spellManager', {
			url: '/spellManager',
			views: {
				'content@': {
					templateUrl: 'partials/spellManager.html',
					controller: 'spellManagerCtrl'
				}
			}
		})
		.state('app.itemManager', {
			url: '/itemManager',
			views: {
				'content@': {
					templateUrl: 'partials/itemManager.html',
					controller: 'itemManagerCtrl'
				}
			}
		});
}]);

//===== CONTROLLERS =====//

app.controller('mainMenuCtrl', ['$scope', '$state', '$rootScope', '_',
	function ($scope, $state, $rootScope, _) {
		$scope.menuTabs = [
			{number: 0, title: 'Home', state: 'app'},
			{number: 1, title: 'Character List', state: 'app.characterList'},
			{number: 2, title: 'Spell Manager', state: 'app.spellManager'},
			{number: 3, title: 'Item Manager', state: 'app.itemManager'}
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

app.controller('characterListCtrl', ['$scope', 'characterService', '$state', '$',
	function ($scope, characterService, $state, $) {
		$scope.characters = [];
		$scope.newCharacter = {};
		$scope.characterToDelete = null;
		function fetchCharacters() {
			characterService.fetchCharacterList()
				.then(function (result) {
					$scope.characters = result.data;
				});
		}
		fetchCharacters();

		$scope.openCreateModal = function () {
			$scope.newCharacter = {};
			$('#newCharacterModal').modal('show');
		};
		$scope.createCharacter = function () {
			characterService.addCharacter($scope.newCharacter)
				.then(function (data) {
					fetchCharacters();
				});
			$('#newCharacterModal').modal('hide');
		};

		$scope.confirmDeleteModal = function (character) {
			$scope.characterToDelete = character;
			$('#deleteCharacterModal').modal('show');
		};
		$scope.deleteCharacter = function () {
			characterService.deleteCharacter($scope.characterToDelete.dbID)
				.then(function () {
					$scope.characterToDelete = null;
					fetchCharacters();
				});
			$('#deleteCharacterModal').modal('hide');
		};
		$scope.cancelDelete = function () {
			$('#deleteCharacterModal').modal('hide');
			$scope.characterToDelete = null;
		};

		$scope.goToCharacter = function (id) {
			$state.go('app.characterPage', {id: id});
		};
	}]);

app.controller('characterPageCtrl', ['$scope', '$stateParams', '_', 'characterService', 'spellService', 'itemService',
	function ($scope, $stateParams, _, characterService, spellService, itemService) {
		$scope.character = null;
		$scope.allSpells = [];
		$scope.characterSpells = [];
		$scope.modalSpell = null;
		$scope.allItems = [];
		$scope.characterItems = [];
		$scope.modalItem = null;
		$scope.totalWeight = 0;
		function updateCharacterSpells() {
			if ($scope.character && $scope.character.spells) {
				$scope.characterSpells = _.filter($scope.allSpells, function (spell) {
					return _.indexOf($scope.character.spells, spell.dbID) >= 0;
				});
			}
		}
		function updateCharacterItems() {
			if ($scope.character && $scope.character.inventory) {
				var totalWeight = 0;
				$scope.characterItems = _.map($scope.character.inventory, function (characterItem) {
					var item = _.findWhere($scope.allItems, {dbID: characterItem.id});
					totalWeight += (item.weight * characterItem.quantity);
					return {item: item, quantity: characterItem.quantity};
				});
				$scope.totalWeight = totalWeight;
			}
		}
		function spellFromId(id) {
			return _.findWhere($scope.allSpells, {dbID: id});
		}
		function itemFromId(id) {
			var item = _.findWhere($scope.allItems, {dbID: id});
			return _.findWhere($scope.characterItems, {item: item});
		}

		characterService.fetchCharacter($stateParams.id)
			.then(function (result) {
				$scope.character = result.data;
			});

		spellService.fetchSpellList()
			.then(function (result) {
				$scope.allSpells = result.data;
				updateCharacterSpells();
			});
		itemService.fetchItemList()
			.then(function (result) {
				$scope.allItems = result.data;
				updateCharacterSpells();
			});

		$scope.spellSubtitle = function () {
			var spell = $scope.modalSpell;
			if (!spell) { return; }
			var prefix = '', suffix = '';
			if (spell.level > 0) {
				prefix = 'Level ' + spell.level.toString() + ' ';
			} else if (spell.level === 0) {
				suffix = ' Cantrip';
			}
			return prefix + spell.type + suffix;
		};

		$scope.addSpellToCharacter = function (id) {
			if (_.indexOf($scope.character.spells, id) === -1) {
				$scope.character.spells.push(id);
			}
		};
		$scope.removeSpellFromCharacter = function (id) {
			var index = _.indexOf($scope.character.spells, id);
			if (index !== -1) {
				$scope.character.spells.splice(index, 1);
			}
		};
		$scope.openSpellModal = function (id) {
			$scope.modalSpell = spellFromId(id);
			$('#spellModal').modal('show');
		};

		$scope.addItemToCharacter = function (id) {
			if (_.indexOf($scope.character.inventory, id) === -1) {
				$scope.character.inventory.push({id: id, quantity: 1});
			}
		};
		$scope.removeItemFromCharacter = function (id) {
			var entry = _.findWhere($scope.character.inventory, {id: id});
			var index = _.indexOf($scope.character.inventory, entry);
			if (index !== -1) {
				$scope.character.inventory.splice(index, 1);
			}
		};
		$scope.openItemModal = function (id) {
			$scope.modalItem = itemFromId(id);
			$('#itemModal').modal('show');
		};

		$scope.$watch('modalItem.quantity', function (quantity) {
			if(!$scope.modalItem) { return; }
			var id = $scope.modalItem.item.dbID;
			_.each($scope.character.inventory, function (characterItem) {
				if(characterItem.id === id) {
					characterItem.quantity = quantity;
				}
			});
		});
		$scope.$watch('character', function (character) {
			if (!character) { return; }
			characterService.updateCharacter($stateParams.id, character)
				.then(function () {
					updateCharacterSpells();
					updateCharacterItems();
				});
		}, true);
	}]);

app.controller('spellManagerCtrl', ['$scope', 'spellService', '$', '_',
	function ($scope, spellService, $, _) {
		$scope.allSpells = [];
		$scope.newSpell = {};
		$scope.editSpell = null;
		var fetchSpells = function () {
			spellService.fetchSpellList()
				.then(function (results) {
					$scope.allSpells = results.data;
				});
		};
		fetchSpells();

		$scope.addSpell = function () {
			spellService.addSpell($scope.newSpell)
				.then(function () {
					fetchSpells();
				});
			$('#addSpellModal').modal('hide');
		};
		$scope.deleteSpell = function (spell) {
			spellService.deleteSpell(spell.dbID)
				.then(function () {
					fetchSpells();
				});
		};
		$scope.updateSpell = function () {
			spellService.updateSpell($scope.editSpell.dbID, $scope.editSpell)
				.then(function () {
					fetchSpells();
				});
			$('#editSpellModal').modal('hide');
		};
		$scope.openEditModal = function (spell) {
			$scope.editSpell = _.extend({}, spell);
			$('#editSpellModal').modal('show');
		};
		$scope.openNewModal = function () {
			$scope.newSpell = {};
			$('#addSpellModal').modal('show');
		};
	}]);

app.controller('itemManagerCtrl', ['$scope', 'itemService', '$', '_',
	function ($scope, itemService, $, _) {
		$scope.allItems = [];
		$scope.newItem = {};
		$scope.editItem = null;
		var fetchItems = function () {
			itemService.fetchItemList()
				.then(function (results) {
					$scope.allItems = results.data;
				});
		};
		fetchItems();

		$scope.addItem = function () {
			itemService.addItem($scope.newItem)
				.then(function () {
					fetchItems();
				});
			$('#addItemModal').modal('hide');
		};
		$scope.deleteItem = function (spell) {
			itemService.deleteItem(spell.dbID)
				.then(function () {
					fetchItems();
				});
		};
		$scope.updateItem = function () {
			itemService.updateItem($scope.editItem.dbID, $scope.editItem)
				.then(function () {
					fetchItems();
				});
			$('#editItemModal').modal('hide');
		};
		$scope.openEditModal = function (item) {
			$scope.editItem = _.extend({}, item);
			$('#editItemModal').modal('show');
		};
		$scope.openNewModal = function () {
			$scope.newItem = {};
			$('#addItemModal').modal('show');
		};
	}]);

//===== DIRECTIVES =====//

app.directive('editableField', ['$', '_', function ($, _) {
	return {
		restrict: 'E',
		scope: {
			fieldValue: '=',
			number: '@'
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
			var fullHealthColor = [34, 138, 0];
			var lowHealthColor = [176, 0, 0];

			function colorByHealth() {
				var fullMod = scope.health.current / scope.health.max;
				var lowMod = 1 - fullMod;
				var color = _.map([0, 0, 0], function (element, index) {
					return Math.ceil((fullMod * fullHealthColor[index]) + (lowMod * lowHealthColor[index]));
				});
				return 'rgb(' + color[0].toString() + ',' + color[1].toString() + ',' + color[2].toString() + ')';
			}

			var width = _.parseInt(scope.width), height = 50, border = 8, buffer = 16, fontSize = 12,
				tempHealthColor = '#5AA1BF', healthBorderColor = 'darkgrey';
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
					.attr('stroke', tempHealthColor)
					.attr('stroke-width', border);
				tempHealthBorder.transition()
					.attr('stroke-opacity', (tempHealth / maxHealth));
				tempHealthBorder.exit().remove();

				var healthFill = healthBarContainer.selectAll('rect.fill').data([currentHealth]);
				healthFill.enter()
					.append('rect')
					.classed('fill', true)
					.attr('clip-path', 'url(' + $location.absUrl() + '#' + healthBarClip + ')')
					.attr('width', width)
					.attr('height', height)
					.attr('x', buffer + border/2).attr('y', buffer + border/2)
					.attr('fill', colorByHealth())
					.attr('stroke', 'none');
				healthFill.transition()
					.attr('fill', colorByHealth())
				healthFill.exit().remove();

				var healthOutline = healthBarContainer.selectAll('rect.outline').data([currentHealth]);
				healthOutline.enter()
					.append('rect')
					.classed('outline', true)
					.attr('width', width)
					.attr('height', height)
					.attr('x', buffer + border/2).attr('y', buffer + border/2)
					.attr('fill', 'none')
					.attr('stroke', healthBorderColor)
					.attr('stroke-width', 1);
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

app.service('characterService', ['$http', function ($http) {
	return {
		fetchCharacter: function (id) {
			return $http.get('/api/getCharacter?id=' + id);
		},
		fetchCharacterList: function () {
			return $http.get('/api/characters');
		},
		deleteCharacter: function (id) {
			return $http.get('/api/deleteCharacter?id=' + id);
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

app.service('spellService', ['$http', function ($http) {
	return {
		fetchSpell: function (id) {
			return $http.get('/api/getSpell?id=' + id);
		},
		fetchSpellList: function () {
			return $http.get('/api/allSpells');
		},
		deleteSpell: function (id) {
			return $http.get('/api/deleteSpell?id=' + id);
		},
		addSpell: function (params) {
			return $http.post('/api/addSpell', params);
		},
		updateSpell: function (id, params) {
			var postParams = {dbID: id, params: params};
			return $http.post('/api/updateSpell', postParams);
		}
	}
}]);

app.service('itemService', ['$http', function ($http) {
	return {
		fetchItem: function (id) {
			return $http.get('/api/getItem?id=' + id);
		},
		fetchItemList: function () {
			return $http.get('/api/allItems');
		},
		deleteItem: function (id) {
			return $http.get('/api/deleteItem?id=' + id);
		},
		addItem: function (params) {
			return $http.post('/api/addItem', params);
		},
		updateItem: function (id, params) {
			var postParams = {dbID: id, params: params};
			return $http.post('/api/updateItem', postParams);
		}
	}
}]);
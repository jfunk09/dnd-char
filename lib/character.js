function Character(json) {
	this.name = json.name || 'Unnamed Character';
	this.race = json.race || 'Unknown Race';
	this.charClass = json.charClass || 'Unknown Class';
	this.inventory = [];
	this.features = [];
	this.flavor = {};
	this.money = {
		copper: 0,
		silver: 0,
		electrum: 0,
		gold: 0,
		platinum: 0
	};
	this.abilityScores = json.abilityScores || { 
		strength: 10,
		dexterity: 10,
		constitution: 10,
		intelligence: 10,
		wisdom: 10,
		charisma: 10
	};
};

Character.prototype.getAbilityScore = function (ability) {
	var abilityScore = this.abilityScores.ability;
	return abilityScore ? abilityScore : null;
};

Character.prototype.setAbilityScore = function (ability, score) {
	if (this.abilityScores.ability) {
		this.abilityScores.ability = score;
	}
};

Character.prototype.toJSON = function () {
	var json = {
		name: this.name,
		race: this.race,
		charClass: this.charClass,
		inventory: this.inventory,
		features: this.features,
		flavor: this.flavor,
		money: this.money,
		abilityScores: this.abilityScores,
		toJSON: true
	};
	return json;
}

module.exports = Character;
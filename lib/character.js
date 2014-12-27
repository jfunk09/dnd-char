function Character(json) {
	this.dbID = json._id;
	this.name = json.name || 'Unnamed Character';
	this.race = json.race || 'Unknown Race';
	this.charClass = json.charClass || 'Unknown Class';
	this.health = json.health || { max: 10, current: 10, temp: 0 };
	this.spells = json.spells || [];
	this.spellSlots = json.spellSlots || [0,0,0,0,0,0,0,0,0];
	this.inventory = json.inventory || [];
	this.features = json.features || [];
	this.flavor = json.flavor || {};
	this.money = json.money || {
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
}

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
		dbID: this.dbID,
		name: this.name,
		race: this.race,
		health: this.health,
		spells: this.spells,
		spellSlots: this.spellSlots,
		charClass: this.charClass,
		inventory: this.inventory,
		features: this.features,
		flavor: this.flavor,
		money: this.money,
		abilityScores: this.abilityScores
	};
	return json;
};

module.exports = Character;
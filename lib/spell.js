function Spell(json) {
    this.dbID = json._id;
    this.name = json.name || 'unnamed spell';
    this.level = json.level || 1;
    this.type = json.type || 'spell type';
    this.castingTime = json.castingTime || '1 action';
    this.range = json.range || 'Self';
    this.components = json.components || {
        verbal: true,
        somatic: false,
        material: ''
    };
    this.duration = json.duration || '1 Minute';
    this.concentration = json.concentration || false;
    this.ritual = json.ritual || false;
    this.description = json.description || 'spell description';
    this.additionalLevelMod = json.additionalLevelMod || '';
}

Spell.prototype.toJSON = function () {
    var json = {
        dbID: this.dbID,
        name: this.name,
        level: this.level,
        type: this.type,
        castingTime: this.castingTime,
        range: this.range,
        components: this.components,
        duration: this.duration,
        concentration: this.concentration,
        ritual: this.ritual,
        description: this.description,
        additionalLevelMod: this.additionalLevelMod
    };
    return json;
};

module.exports = Spell;
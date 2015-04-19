function Item(json) {
    this.dbID = json._id;
    this.type = json.type || 'Misc';
    this.name = json.name || 'unnamed item';
    this.weight = json.weight === 0 ? 0 : json.weight || 1;
    this.description = json.description || '';
}

Item.prototype.toJSON = function () {
    var json = {
        dbID: this.dbID,
        type: this.type,
        name: this.name,
        weight: this.weight,
        description: this.description
    };
    return json;
};

module.exports = Item;
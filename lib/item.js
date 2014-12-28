function Item(json) {
    this.dbID = json._id;
    this.name = json.name || 'unnamed item';
    this.weight = json.weight === 0 ? 0 : json.weight || 1;
    this.description = json.description || '';
}

Item.prototype.toJSON = function () {
    var json = {
        dbID: this.dbID,
        name: this.name,
        weight: this.weight,
        description: this.description
    };
    return json;
};

module.exports = Item;
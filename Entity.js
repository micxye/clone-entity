class Entity {
    constructor(id, name, description) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.linksTo = [];
    }

    clone(id) {
        return new Entity(id, this.name, this.description);
    }
}

module.exports = Entity;
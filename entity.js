class Entity {
    constructor(id, name, description) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.links = [];
    }

    clone(newId) {
        return new Entity(newId, this.name, this.description);
    }

    toJSON() {
        const { id, name, description, links } = this;

        const entity = {
            entity_id: id,
            name: name
        }
        if (description) {
            entity.description = description;
        }

        const linksList = [];
        links.forEach(linkedEntityId => {
            linksList.push({ from: id, to: linkedEntityId})
        });

        return { entity, links: linksList }
    }
}

module.exports = Entity;

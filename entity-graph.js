const schema = require('js-schema');
const Entity = require('./entity');

class EntityGraph {
    constructor() {
        this.idToEntity = new Map();
        this.entities = [];
        this.links = [];
        this.usedIds = new Set();
    }

    constructGraph(parsedJsonData) {
        _validateData(parsedJsonData);
        this.entities = parsedJsonData.entities;
        this.links = parsedJsonData.links;

        const idToEntity = new Map();

        this.entities.forEach(entity => {
            const { entity_id, name, description } = entity;
            idToEntity.set(entity_id, new Entity(entity_id, name, description));
            this.usedIds.add(entity_id);
        });
        this.links.forEach(link => {
            const entity = idToEntity.get(link.from);
            entity.addLink(link.to);
        });

        return this.idToEntity = idToEntity;
    }

    cloneEntityAndRelatedEntities(id) {
        const initialEntity = this.idToEntity.get(id);
        if (!initialEntity) {
            throw new Error(`input entity id ${id} not found`);
        }
        const initialClone = initialEntity.clone(this.usedIds);

        _addLinksToInitialClone(this.idToEntity, this.links, id, initialClone.id);
        _cloneRelatedEntities(this.idToEntity, id, initialClone, this.usedIds);
        
        const newEntitiesAndLinks = _formatEntitiesAndLinks(this.idToEntity);
        this.entities = newEntitiesAndLinks.entities;
        this.links = newEntitiesAndLinks.links;

        return this.idToEntity;
    }

    toJSON(space = 4) {
        return JSON.stringify({ entities: this.entities, links: this.links }, null, space);
    }
}

function _validateData(parsedJsonData) {
    const linksSchema = schema({ from: Number, to: Number });
    const entitiesSchema = schema({ entity_id: Number, name: String });
    const validateJson = schema({ entities: Array.of(entitiesSchema), links: Array.of(linksSchema) });
    if (!validateJson(parsedJsonData)) {
        throw new Error('invalid data format');
    }
}

function _addLinksToInitialClone(idToEntity, links, originalId, initialCloneId) {
    links.forEach(link => {
        if (link.to === originalId) {
            const entity = idToEntity.get(link.from);
            entity.addLink(initialCloneId);
        }
    });
}

function _cloneRelatedEntities(idToEntity, id, initialClone, usedIds) {
    const originalIdToClonedEntity = new Map();
    originalIdToClonedEntity.set(id, initialClone);

    const visitedEntityIds = new Set(); // for cycle detection
    // clone related entities
    originalIdToClonedEntity.forEach((clonedEntity, originalId) => {
        const originalEntity = idToEntity.get(originalId);
        originalEntity.links.forEach(linkedId => {
            if (visitedEntityIds.has(linkedId)) {
                return;
            }
            if (originalIdToClonedEntity.has(linkedId)) {
                const clonedLinkedEntity = originalIdToClonedEntity.get(linkedId);
                clonedEntity.addLink(clonedLinkedEntity.id);
                visitedEntityIds.add(clonedLinkedEntity.id);
            } else {
                const linkedEntity = idToEntity.get(linkedId);
                const clonedLinkedEntity = linkedEntity.clone(usedIds);
                originalIdToClonedEntity.set(linkedId, clonedLinkedEntity);
                clonedEntity.addLink(clonedLinkedEntity.id);
            }
        });
    });
    // add cloned entities to graph
    originalIdToClonedEntity.forEach(entity => {
        idToEntity.set(entity.id, entity);
    });
}

function _formatEntitiesAndLinks(entityGraph) {
    const newEntities = [];
    const newLinks = [];
    const parseGraph = (entityGraph) => {
        entityGraph.forEach(entity => {
            const formattedEntity = entity.format();
            newEntities.push(formattedEntity.entity);
            newLinks.push(...formattedEntity.links);
        });
    }
    parseGraph(entityGraph);
    return { entities: newEntities, links: newLinks };
}

module.exports = EntityGraph;

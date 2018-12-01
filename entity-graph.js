const schema = require('js-schema');
const Entity = require('./entity');

class EntityGraph {
    constructor(parsedJson) {
        this.idToEntityMap = new Map();
        
        if (parsedJson) {
            this.constructGraph(parsedJson);
        }
    }

    constructGraph(parsedJson) {
        this._validateJson(parsedJson);
        const idToEntityMap = new Map();

        parsedJson.entities.forEach(entity => {
            const { entity_id, name, description } = entity;
            idToEntityMap.set(entity_id, new Entity(entity_id, name, description));
        });
        parsedJson.links.forEach(link => {
            const entity = idToEntityMap.get(link.from);
            entity.addLink(link.to);
        });
        return this.idToEntityMap = idToEntityMap;
    }

    _validateJson(parsedJson) {
        const Links = schema({ from: Number, to: Number });
        const Entities = schema({ entity_id: Number, name: String });
        const Json = schema({ entities: Array.of(Entities), links: Array.of(Links) });
        if (!Json(parsedJson)) {
            throw new Error('invalid data format');
        }
    }

    cloneEntityAndRelatedEntities(id) {
        if (!this.idToEntityMap.has(id)) {
            throw new Error(`input entity id ${id} not found`);
        }
        const initialEntity = this.idToEntityMap.get(id);
        const initialClone = initialEntity.clone(this._generateId());

        this._cloneRelatedEntities(id, initialClone);
        this._addLinksToInitialClone(id, initialClone.id);

        return this.idToEntityMap;
    }

    _generateId(usedIds = new Set()) {
        const idGenerator = () => Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
        let newId = idGenerator();
        while (usedIds.has(newId) || this.idToEntityMap.has(newId)) {
            newId = idGenerator();
        }
        usedIds.add(newId);
        return newId;
    }

    _cloneRelatedEntities(id, initialClone) {
        const originalIdToClonedEntity = new Map();
        originalIdToClonedEntity.set(id, initialClone);
        // create clones
        const stack = [this.idToEntityMap.get(id)];
        const usedIds = new Set();
        while (stack.length > 0) {
            const currentEntity = stack.pop();
            currentEntity.links.forEach(linkedId => {
                if (originalIdToClonedEntity.has(linkedId)) {
                    return;
                }
                const linkedEntity = this.idToEntityMap.get(linkedId);
                const linkedEntityClone = linkedEntity.clone(this._generateId(usedIds));
                originalIdToClonedEntity.set(linkedEntity.id, linkedEntityClone);
                stack.push(linkedEntity);
            });
        }
        // add links between clones
        originalIdToClonedEntity.forEach((clonedEntity, originalId) => {
            const originalEntity = this.idToEntityMap.get(originalId);
            originalEntity.links.forEach(linkedId => {
                const linkedEntityClone = originalIdToClonedEntity.get(linkedId);
                clonedEntity.addLink(linkedEntityClone.id);
            });
        });
        // add cloned entities to graph
        originalIdToClonedEntity.forEach(clonedEntity => {
            this.idToEntityMap.set(clonedEntity.id, clonedEntity);
        });
    }

    _addLinksToInitialClone(originalId, initialCloneId) {
        this.idToEntityMap.forEach(entity => {
            if (entity.links.has(originalId)) {
                entity.addLink(initialCloneId);
            }
        });
    }

    toJSON(space = 4) {
        const entities = [];
        const links = [];
        const parseEntityMap = (entityMap) => {
            entityMap.forEach(entity => {
                const formattedEntity = entity.format();
                entities.push(formattedEntity.entity);
                links.push(...formattedEntity.links);
            });
        }
        parseEntityMap(this.idToEntityMap);
        return JSON.stringify({ entities, links }, null, space);
    }
}

module.exports = EntityGraph;

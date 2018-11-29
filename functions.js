const Entity = require('./entity');

function cloneEntityAndRelatedEntities(jsonData, id) {
    const usedIds = createUsedIdsSet(jsonData);
    const initialCloneId = generateId(usedIds);

    const idToEntityMap = createEntityMap(jsonData, id, initialCloneId);
    const originalIdToClonedEntityMap = cloneEntities(idToEntityMap, id, initialCloneId, usedIds);

    return convertEntityMapsToJson(idToEntityMap, originalIdToClonedEntityMap);
}

function createEntityMap(jsonData, id, initialCloneId) {
    const idToEntityMap = new Map();

    jsonData.entities.forEach(entity => {
        const { entity_id, name, description } = entity;
        idToEntityMap.set(entity_id, new Entity(entity_id, name, description));
    });
    jsonData.links.forEach(link => {
        const entity = idToEntityMap.get(link.from);
        entity.addLink(link.to);
        if (link.to === id) { // create links to initial cloned entity
            entity.addLink(initialCloneId);
        }
    });
    return idToEntityMap;
}

function cloneEntities(idToEntityMap, id, initialCloneId, usedIds) {
    // create initial clone
    const initialEntity = idToEntityMap.get(id);
    const initialClone = initialEntity.clone(initialCloneId);

    const originalIdToClonedEntityMap = new Map();
    originalIdToClonedEntityMap.set(id, initialClone);

    const visitedEntityIds = new Set(); // for cycle detection

    originalIdToClonedEntityMap.forEach((clonedEntity, originalId) => {
        const originalEntity = idToEntityMap.get(originalId);
        originalEntity.links.forEach(linkedId => {
            if (visitedEntityIds.has(linkedId)) {
                return;
            }    
            if (originalIdToClonedEntityMap.has(linkedId)) {
                const clonedLinkedEntity = originalIdToClonedEntityMap.get(linkedId);
                clonedEntity.addLink(clonedLinkedEntity.id);
                visitedEntityIds.add(clonedLinkedEntity.id);
            } else {
                const linkedEntity = idToEntityMap.get(linkedId);
                const clonedLinkedEntity = linkedEntity.clone(generateId(usedIds));
                originalIdToClonedEntityMap.set(linkedId, clonedLinkedEntity);
                clonedEntity.addLink(clonedLinkedEntity.id);
            }
        });
    });
    return originalIdToClonedEntityMap;
}

function convertEntityMapsToJson(idToEntityMap, originalIdToClonedEntityMap) {
    const entities = [];
    const links = [];
    const translateMap = (entityMap) => {
        entityMap.forEach(entity => {
            const entityJSON = entity.toJSON();
            entities.push(entityJSON.entity);
            links.push(...entityJSON.links);
        });
    }
    translateMap(idToEntityMap);
    translateMap(originalIdToClonedEntityMap);
    return { entities, links };
}

function createUsedIdsSet(jsonData) {
    const usedIdsSet = new Set();
    jsonData.entities.forEach(entity => {
        usedIdsSet.add(entity.entity_id);
    });
    return usedIdsSet;
}

function generateId(usedIds) {
    const randomNum = () => Math.round(Math.random() * 1000000);
    let newId = randomNum();
    while (usedIds.has(newId)) {
        newId = randomNum();
    }
    usedIds.add(newId);
    return newId;
}

module.exports = {
    cloneEntityAndRelatedEntities,
    createEntityMap,
    cloneEntities,
    convertEntityMapsToJson,
    createUsedIdsSet,
    generateId
}
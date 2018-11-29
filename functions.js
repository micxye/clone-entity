const Entity = require('./Entity');

function cloneEntityAndRelatedEntities(jsonData, id) {
    if (!validateJsonData(jsonData)) {
        throw new Error();
    }

    const initialCloneId = generateId();
    const entityMap = createEntityMap(jsonData, id, initialCloneId);

    // clone related entities, create links between them
    const clonedEntitiesMap = cloneRelatedEntities(entityMap, id, initialCloneId);

    // add to entity map
    // convert entity map to json structure
    return convertEntityMapsToJson(entityMap, clonedEntitiesMap);
}

function validateJsonData(jsonData) {
    // do some validation
    // validate input id also???
    return true;
}

// returns a map of entity objects
// creates links to initial cloned entity
function createEntityMap(jsonData, id, initialCloneId) {
    const entityMap = new Map();

    jsonData.entities.forEach(entity => {
        const { entity_id, name, description } = entity;
        entityMap.set(entity_id, new Entity(entity_id, name, description));
    });
    jsonData.links.forEach(link => {
        const entity = entityMap.get(link.from);
        entity.linksTo.push(link.to);
        if (link.to === id) {
            entity.linksTo.push(initialCloneId);
        }
    });

    return entityMap;
}

// creates a new map of cloned entities with links
// store clones in a map, with the key = original entity id, value = cloned entity
function cloneRelatedEntities(entityMap, id, initialCloneId) {
    const initialEntity = entityMap.get(id);
    const initialClone = initialEntity.clone(initialCloneId);

    const clonedEntitiesMap = new Map();
    clonedEntitiesMap.set(id, initialClone);

    // set for cycle detection
    const visitedCycleSet = new Set();

    clonedEntitiesMap.forEach((clonedEntity, originalId) => {
        const originalEntity = entityMap.get(originalId);
        originalEntity.linksTo.forEach(linkedId => {
            if (!visitedCycleSet.has(linkedId)) {
                if (clonedEntitiesMap.has(linkedId)) {
                    const clonedLinkedEntity = clonedEntitiesMap.get(linkedId);
                    clonedEntity.linksTo.push(clonedLinkedEntity.id);
                    visitedCycleSet.add(clonedLinkedEntity.id);
                } else { // create a clone of the linked entity
                    const linkedEntity = entityMap.get(linkedId);
                    const clonedLinkedEntity = linkedEntity.clone(generateId());
                    clonedEntitiesMap.set(linkedId, clonedLinkedEntity);
                    // link the current cloned entity to the new created clone entity
                    clonedEntity.linksTo.push(clonedLinkedEntity.id);
                }
            }
        });
    });
    return clonedEntitiesMap;
}

function convertEntityMapsToJson(entityMap, clonedEntitiesMap) {
    const entities = [];
    const links = [];
    const parseMap = (entityMap) => {
        entityMap.forEach(entity => {
            const { id, name, description, linksTo } = entity;

            const convertedEntity = {
                entity_id: id,
                name: name
            };
            if (description) {
                convertedEntity.description = description
            }
            entities.push(convertedEntity);

            linksTo.forEach(linkId => {
                links.push({ from: id, to: linkId });
            });
        });
    }
    parseMap(entityMap);
    parseMap(clonedEntitiesMap);
    return { entities, links };
}

function generateId() {
    const randomNum = () => Math.round(Math.random() * 100000);
    let id = randomNum();
    // while (id not unique...)
    return id;
}

module.exports = {
    cloneEntityAndRelatedEntities
}
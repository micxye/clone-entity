function validateJsonData(jsonData) {
    
}

function findEntityById(entities, id) {
    let targetEntity = null;

    entities.forEach(entity => {
        if (entity.entity_id === id) {
            targetEntity = entity;
        }
    });

    if (!targetEntity) {
        throw new Error(`entity_id ${id} not found`);
    } else {
        return targetEntity;
    }
}

// finds related entities to input id entity and creates clones
// store clones in a map, with the key = original entity id, value = cloned entity
function cloneRelatedEntities(jsonData, id) {
    const { entities, links } = jsonData;
    const initialEntity = findEntityById(entities, id);
    const initialClone = createClone(entities, initialEntity);

    const clonedEntitiesMap = new Map();
    clonedEntitiesMap.set(id, initialClone);

    clonedEntitiesMap.forEach((entity, originalId) => {
        links.forEach(link => {
            if (link.from === originalId) {
                // clone linked entity
                let linkedEntity = findEntityById(entities, link.to);
                let clonedLinkedEntity = createClone(entities, linkedEntity);
                clonedEntitiesMap.set(link.to, clonedLinkedEntity);
            }
        });
    })
    return clonedEntitiesMap;
}

function createLinksToInitialClone(links, id, initialClone) {
    const newLinks = [];
    links.forEach(link => {
        if (link.to === id) {
            newLinks.push(createLink(link.from, initialClone.entity_id));
        }
    });
    return newLinks;
}

function createLinksBetweenClonedEntities(links, clonedEntitiesMap) {
    const newLinks = [];
    clonedEntitiesMap.forEach((entity, originalId) => {
        links.forEach(link => {
            if (link.from === originalId) {
                let clonedIdFrom = clonedEntitiesMap.get(link.from).entity_id
                let clonedIdTo = clonedEntitiesMap.get(link.to).entity_id;
                newLinks.push(createLink(clonedIdFrom, clonedIdTo));
            }
        });
    });
    return newLinks;
}

function createLink(from, to) {
    return { from, to };
}

function createClone(entities, entity) {
    const newEntity = JSON.parse(JSON.stringify(entity));
    const usedIds = (() => {
        const usedIdsSet = new Set();
        entities.forEach(entity => {
            usedIdsSet.add(entity.entity_id);
        });
        return usedIdsSet;
    })();

    newEntity.entity_id = generateID(usedIds);
    return newEntity;
}

function generateID(usedIds) {
    let id = randomNum();
    while (usedIds.has(id)) {
        id = randomNum();
    }
    return id;
}

function randomNum() {
    return Math.round(Math.random() * 100000);
}

module.exports = {
    validateJsonData,
    findEntityById,
    cloneRelatedEntities,
    createLinksToInitialClone,
    createLinksBetweenClonedEntities,
    createClone,
    createLink,
    generateID
}
// console.log(process.argv);

// hard coded inputs for now
const json = {
  entities: [
    {
      entity_id: 3,
      name: "EntityA"
    },
    {
      entity_id: 5,
      name: "EntityB"
    },
    {
      entity_id: 7,
      name: "EntityC",
      description: "More details about entity C"
    },
    {
      entity_id: 11,
      name: "EntityD"
    }
  ],
  links: [
    {
      from: 3,
      to: 5
    },
    {
      from: 3,
      to: 7
    },
    {
      from: 5,
      to: 7
    },
    {
      from: 7,
      to: 11
    },
    // edge case w/ cycle
    // {
    //     from: 11,
    //     to: 5,
    // }
  ]
};

const id = 5;

// creates a set of used ID's
const usedIds = (() => {
    const usedIdsSet = new Set();
    json.entities.forEach(entity => {
        usedIdsSet.add(entity.entity_id);
    });
    return usedIdsSet;
})();

console.log(cloneEntity());

function cloneEntity() {
    // read file and store in global variables

    const initialEntity = findEntity(json.entities, id);
    const initialClone = createClone(initialEntity);
    const clonedEntitiesMap = cloneRelatedEntities(json.links, initialClone);
    const clonedEntities = [];
    clonedEntitiesMap.forEach(entity => {
        clonedEntities.push(entity);
    })

    const linksToInitialClone = createLinksToInitialClone(json.links, initialClone);
    const linksToClonedEntities = createLinksToClonedEntities(json.links, clonedEntitiesMap);
    return {
        entities: [...json.entities, ...clonedEntities],
        links: [...json.links, ...linksToInitialClone, ...linksToClonedEntities]
    };
}

// finds related entities and clones them
// returns a map, with the key = original entity id, value = cloned entity
function cloneRelatedEntities(links, initialClone) {
    const clonedEntitiesMap = new Map();
    clonedEntitiesMap.set(id, initialClone);

    clonedEntitiesMap.forEach((entity, originalId) => {
        links.forEach(link => {
            if (link.from === originalId) {
                // clone linked entity
                let linkedEntity = findEntity(json.entities, link.to);
                let clonedLinkedEntity = createClone(linkedEntity);
                clonedEntitiesMap.set(link.to, clonedLinkedEntity);
            }
        });
    })

    return clonedEntitiesMap;
}

function createLinksToInitialClone(links, initialClone) {
    const newLinks = [];
    links.forEach(link => {
        if (link.to === id) {
            newLinks.push(createLink(link.from, initialClone.entity_id));
        }
    });
    return newLinks;
}

function createLinksToClonedEntities(links, clonedEntitiesMap) {
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

// traverses links to find related entities
// if entity links to initial entity, create new link with same entity
// if initial entity links to another entity, create a clone of the other entity, as well as links

function createLink(from, to) {
    return { from, to };
}

// This function will find and return the initial entity.
// It will also populate the usedID's set
function findEntity(entities, id) {
    let targetEntity = null;

    entities.forEach(entity => {
        if (entity.entity_id === id) {
            targetEntity = entity;
        }
    });

    if (!targetEntity) {
        throwError(`entity_id ${id} not found`);
    } else {
        return targetEntity;
    }
}

function createClone(entity) {
    let newEntity = JSON.parse(JSON.stringify(entity));
    newEntity.entity_id = generateID();
    return newEntity;
}

function generateID() {
    let id = randomNum();
    while (usedIds.has(id)) {
        id = randomNum();
    }
    usedIds.add(id);
    return id;
}

function randomNum() {
    return Math.round(Math.random() * 100000);
}

function throwError(message) {
    throw new Error(message);
}
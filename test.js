const { cloneEntityAndRelatedEntities } = require("./functions");

const jsonData = {
    "entities": [
        {
            "entity_id": 3,
            "name": "EntityA"
        },
        {
            "entity_id": 5,
            "name": "EntityB"
        },
        {
            "entity_id": 7,
            "name": "EntityC",
            "description": "More details about entity C"
        },
        {
            "entity_id": 11,
            "name": "EntityD"
        }
    ],
    "links": [
        {
            "from": 3,
            "to": 5
        },
        {
            "from": 3,
            "to": 7
        },
        {
            "from": 5,
            "to": 7
        },
        {
            "from": 7,
            "to": 11
        }
    ]
}

// describe('findEntityById', () => {
//     it('should return the entity object if found', () => {
//         expect(findEntityById(jsonData.entities, 3)).toEqual({ entity_id: 3, name: 'EntityA' });
//     });

//     it('should throw an error if not found', () => {
//         expect(() => findEntityById(jsonData.entities, 4)).toThrow();
//     });
// });

// describe('cloneRelatedEntities', () => {
//     const clonedEntitiesMap = cloneRelatedEntities(jsonData, 7);

//     it('should return a map object with key 7', () => {
//         expect(clonedEntitiesMap.has(7)).toBe(true);
//     });

//     it('should have cloned entity_id = 11 (key 11)', () => {
//         expect(clonedEntitiesMap.has(11)).toBe(true);
//     });

//     it('should not have cloned entity_id = 5', () => {
//         expect(clonedEntitiesMap.has(5)).toBe(false);
//     });

//     const jsonDataWithCycle = JSON.parse(JSON.stringify(jsonData));
//     jsonDataWithCycle.links.push({ from: 11, to: 5 });
//     const clonedEntitiesMapCycle = cloneRelatedEntities(jsonDataWithCycle, 7);

//     it('should handle link cycles', () => {
//         expect(clonedEntitiesMapCycle.has(7)).toBe(true);
//     });
// })


// describe('createLink', () => {
//     it('should return an object with its inputs as values', () => {
//         expect(createLink(10, 20)).toEqual({ from: 10, to: 20 });
//     });
// });

// describe('', () => {
//     it('', () => { });
// })

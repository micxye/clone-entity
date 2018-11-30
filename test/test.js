const { jsonData, cycleJsonData } = require('./jsonTestData');
const {
    cloneEntityAndRelatedEntities,
    createEntityMap,
    cloneEntities,
    convertEntityMapsToJson,
    createUsedIdsSet,
    generateId
} = require('../clone-entity');
const Entity = require('../entity');

describe('Entity class', () => {
    const entity1 = new Entity(1, 'EntityA');
    test('addLink method should add an id to the links property', () => {
        entity1.addLink(2);
        expect(entity1.links.has(2)).toBe(true);
    });

    test('cloneId method should return a new Entity object with the same name', () => {
        const entity1Clone = entity1.clone(3);
        expect(entity1Clone.name === entity1.name).toBe(true);
    });

    test('toJSON method should return an object formatted to the specification', () => {
        const entity1JSON = entity1.toJSON();
        expect(entity1JSON.entity.entity_id === entity1.id).toBe(true);
        expect(entity1JSON.entity.name === entity1.name).toBe(true);
        expect(entity1JSON.links[0].to).toEqual(Array.from(entity1.links)[0]);
    });
});

describe('cloneEntityAndRelatedEntities', () => {
    it('should return a new object with cloned entities if id is found', () => {
        expect(typeof cloneEntityAndRelatedEntities(jsonData, 3) === 'object').toBe(true);
    });

    it('should throw an error if id is not found in jsonData', () => {
        expect(() => cloneEntityAndRelatedEntities(jsonData, 4)).toThrow();
    });
});

describe('createEntityMap', () => {
    const idToEntityMap = createEntityMap(jsonData, 5, 1337);

    it('should create a key-value pair for each entity', () => {
        expect(idToEntityMap.has(3)).toBe(true);
        expect(idToEntityMap.has(5)).toBe(true);
        expect(idToEntityMap.has(7)).toBe(true);
        expect(idToEntityMap.has(11)).toBe(true);
    });

    it('should add links to the initialCloneId', () => {
        expect(idToEntityMap.get(3).links.has(1337)).toBe(true);
    });
});

describe('cloneEntities', () => {
    const idToEntityMap = createEntityMap(jsonData, 7, 1337);
    const usedIds = createUsedIdsSet(jsonData);
    const originalIdToClonedEntityMap = cloneEntities(idToEntityMap, 7, 1337, usedIds);

    it('should return a map object with keys 7 and 11', () => {
        expect(originalIdToClonedEntityMap.has(7)).toBe(true);
        expect(originalIdToClonedEntityMap.has(11)).toBe(true);
    });

    it('should not have cloned entity_id 5', () => {
        expect(originalIdToClonedEntityMap.has(5)).toBe(false);
    });
});

describe('cloneEntities (with 3 entities linked cycle)', () => {
    const idToEntityMap = createEntityMap(cycleJsonData, 7, 1337);
    const usedIds = createUsedIdsSet(jsonData);
    const originalIdToClonedEntityMap = cloneEntities(idToEntityMap, 7, 1337, usedIds);

    it('should return a map object with keys 5, 7 and 11', () => {
        expect(originalIdToClonedEntityMap.has(5)).toBe(true);
        expect(originalIdToClonedEntityMap.has(7)).toBe(true);
        expect(originalIdToClonedEntityMap.has(11)).toBe(true);
    });

    it('should not have 3 keys total', () => {
        expect(originalIdToClonedEntityMap.size).toBe(3);
    });
});

describe('convertEntityMapsToJson', () => {
    const idToEntityMap = createEntityMap(jsonData, 5, 1337);
    const usedIds = createUsedIdsSet(jsonData);
    const originalIdToClonedEntityMap = cloneEntities(idToEntityMap, 5, 1337, usedIds);
    const newJsonEntities = convertEntityMapsToJson(idToEntityMap, originalIdToClonedEntityMap);

    it('should return a new JSON formatted object with all entities and links', () => {
        expect(typeof newJsonEntities === 'object').toBe(true);
        expect(newJsonEntities.entities.length === 7).toBe(true);
        expect(newJsonEntities.links.length === 7).toBe(true);
    });
});

describe('createUsedIdsSet', () => {
    const usedIds = createUsedIdsSet(jsonData);
    
    it ('should create a set of used Id\'s', () => {
        expect(usedIds.size).toEqual(jsonData.entities.length);
    });
});

describe('generateId', () => {
    const usedIds = createUsedIdsSet(jsonData);
    const initialSize = usedIds.size;

    it('should create a unique Id and add it to the set', () => {
        generateId(usedIds);
        expect(usedIds.size).toEqual(initialSize + 1);
    });
});

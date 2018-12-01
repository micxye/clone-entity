const EntityGraph = require('../entity-graph');
const Entity = require('../entity');
const { parsedJsonData, parsedCycleJsonData } = require('./json-test-data');

describe('EntityGraph class', () => {
    const eg = new EntityGraph();

    describe('constructGraph method', () => {
        it('should throw an error if input is not valid', () => {
            expect(() => eg.constructGraph({ entities: { entity_id: '1' }})).toThrowError('invalid');
        });

        eg.constructGraph(parsedJsonData);

        it('should create and return a map of ids to entities', () => {
            expect(eg.idToEntityMap.has(3)).toBe(true);
            expect(eg.idToEntityMap.has(5)).toBe(true);
            expect(eg.idToEntityMap.has(7)).toBe(true);
            expect(eg.idToEntityMap.has(11)).toBe(true);
        });
    });

    describe('cloneEntityAndRelatedEntities method', () => {
        it('should throw an error if id is not found in graph', () => {
            expect(() => eg.cloneEntityAndRelatedEntities(1)).toThrowError('not found');
        });

        it('should clone the input entity and its related entities and add them to the graph', () => {
            expect(eg.cloneEntityAndRelatedEntities(5).size).toEqual(7);
        });

        const egCycle = new EntityGraph();
        egCycle.constructGraph(parsedCycleJsonData);
        egCycle.cloneEntityAndRelatedEntities(7)

        it('should handle link cycles', () => {
            expect(egCycle.idToEntityMap.size).toEqual(7);
        });
    });

    describe('_generateId private method', () => {
        it('should generate a unique id', () => {
            const uniqueId = eg._generateId();
            expect(eg.idToEntityMap.has(uniqueId)).toBe(false);
        });
    });

    describe('toJSON method', () => {
        const anotherEg = new EntityGraph();
        anotherEg.constructGraph(parsedJsonData);

        it('should output valid JSON in the specified format', () => {
            expect(JSON.parse(anotherEg.toJSON())).toEqual(parsedJsonData);
        });
    });
});

describe('Entity class', () => {
    const entityA = new Entity(1, 'EntityA', 'the original entity');
    
    describe('addLink method', () => {
        it('should add an id to the links property', () => {
            entityA.addLink(2);
            expect(entityA.links.has(2)).toBe(true);
        });
    });

    describe('clone method', () => {
        it('should return a new Entity object with the same name & description', () => {
            const entityAClone = entityA.clone();
            expect(entityAClone.name === entityA.name).toBe(true);
            expect(entityAClone.description === entityA.description).toBe(true);
        });
    });

    describe('format method', () => {
        it('should return an object formatted to the specification', () => {
            const formattedEntity = entityA.format();
            expect(formattedEntity.entity.entity_id === entityA.id).toBe(true);
            expect(formattedEntity.entity.name === entityA.name).toBe(true);
            expect(formattedEntity.links[0].to).toEqual(Array.from(entityA.links)[0]);
        });
    });
});

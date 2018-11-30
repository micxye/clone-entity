const { parsedJsonData, parsedCycleJsonData } = require('./json-test-data');
const EntityGraph = require('../entity-graph');
const Entity = require('../entity');

describe('EntityGraph', () => {
    const eg = new EntityGraph();

    describe('constructGraph method', () => {
        it('should throw an error if input is not valid JSON or formatted correctly', () => {
            expect(() => eg.constructGraph({ entities: { entity_id: '1' }})).toThrow();
        });

        eg.constructGraph(parsedJsonData);

        it('should create and return a map of ids to entities', () => {
            expect(eg.adjacencyList.has(3)).toBe(true);
            expect(eg.adjacencyList.has(5)).toBe(true);
            expect(eg.adjacencyList.has(7)).toBe(true);
            expect(eg.adjacencyList.has(11)).toBe(true);
        });

        it('should add ids to the usedIds set', () => {
            expect(eg.usedIds.has(3)).toBe(true);
            expect(eg.usedIds.has(5)).toBe(true);
            expect(eg.usedIds.has(7)).toBe(true);
            expect(eg.usedIds.has(11)).toBe(true);
        });

        it('should add the original formatted data to the entities and links properties', () => {
            expect(eg.entities).toEqual(parsedJsonData.entities);
            expect(eg.links).toEqual(parsedJsonData.links);
        });
    });

    describe('cloneEntityAndRelatedEntities method', () => {
        it('should throw an error if id is not found in parsedJsonData', () => {
            expect(() => eg.cloneEntityAndRelatedEntities(4)).toThrow();
        });

        it('should clone the input entity and its related entities and add them to the graph', () => {
            expect(eg.cloneEntityAndRelatedEntities(5).size).toEqual(7);
        });

        const egCycle = new EntityGraph();
        egCycle.constructGraph(parsedCycleJsonData);
        egCycle.cloneEntityAndRelatedEntities(7)

        it('should handle link cycles', () => {
            expect(egCycle.adjacencyList.size).toEqual(7);
        });

        it('should add clonedIds to the usedIds set', () => {
            expect(eg.usedIds.size).toEqual(7);
            expect(egCycle.usedIds.size).toEqual(7);
        });

        it('should update the entities and links properties with the new cloned data', () => {
            expect(eg.entities.length).toEqual(7);
            expect(eg.links.length).toEqual(7);
            expect(egCycle.entities.length).toEqual(7);
            expect(egCycle.links.length).toEqual(10);
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
    const entity1 = new Entity(1, 'EntityA', 'the original entity');
    test('addLink method should add an id to the links property', () => {
        entity1.addLink(2);
        expect(entity1.links.has(2)).toBe(true);
    });

    test('clone method should return a new Entity object with the same name & description', () => {
        const entity1Clone = entity1.clone();
        expect(entity1Clone.name === entity1.name).toBe(true);
        expect(entity1Clone.description === entity1.description).toBe(true);
    });

    test('format method should return an object formatted to the specification', () => {
        const formattedEntity = entity1.format();
        expect(formattedEntity.entity.entity_id === entity1.id).toBe(true);
        expect(formattedEntity.entity.name === entity1.name).toBe(true);
        expect(formattedEntity.links[0].to).toEqual(Array.from(entity1.links)[0]);
    });
});
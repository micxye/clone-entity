const fs = require('fs');
const path = require('path');
const {
    cloneRelatedEntities,
    createLinksToInitialClone,
    createLinksBetweenClonedEntities,
} = require('./functions');

console.log(cloneEntityAndRelatedEntities());

function cloneEntityAndRelatedEntities() {
    // command line arguments/inputs
    const jsonData = (() => {
        const filePath = path.join(__dirname, process.argv[2]);
        const data = JSON.parse(fs.readFileSync(`/${filePath}`));
        return data;
    })();
    const id = Number(process.argv[3]);

    // clone related entities
    const clonedEntitiesMap = cloneRelatedEntities(jsonData, id);
    const clonedEntities = [];
    clonedEntitiesMap.forEach(entity => {
        clonedEntities.push(entity);
    })

    // create links
    const linksToInitialClone = createLinksToInitialClone(jsonData.links, id, clonedEntities[0]);
    const linksBetweenClonedEntities = createLinksBetweenClonedEntities(jsonData.links, clonedEntitiesMap);

    return {
        entities: [...jsonData.entities, ...clonedEntities],
        links: [...jsonData.links, ...linksToInitialClone, ...linksBetweenClonedEntities]
    };
}

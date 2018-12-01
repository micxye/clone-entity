const fs = require('fs');
const path = require('path');
const EntityGraph = require('./entity-graph');

console.log(cloneEntity());

function cloneEntity() {
    const parsedJson = (() => { 
        const filePath = path.join(__dirname, process.argv[2]);
        const data = JSON.parse(fs.readFileSync(`/${filePath}`));
        return data;
    })();
    const id = Number(process.argv[3]);
    // process.argv.length < 4 ? throw missing arguments error

    const eg = new EntityGraph();
    eg.constructGraph(parsedJson);
    eg.cloneEntityAndRelatedEntities(id);
    return eg.toJSON()
}

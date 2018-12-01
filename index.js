const fs = require('fs');
const path = require('path');
const EntityGraph = require('./entity-graph');

console.log(cloneEntity());

function cloneEntity() {
    if (process.argv.length < 4) {
        throw new Error('Missing inputs. Enter \'npm start <inputfile> <entityid>\'')
    }

    const parsedJson = (() => { 
        const filePath = path.join(__dirname, process.argv[2]);
        const data = JSON.parse(fs.readFileSync(`/${filePath}`));
        return data;
    })();
    const id = Number(process.argv[3]);

    const eg = new EntityGraph(parsedJson);
    eg.cloneEntityAndRelatedEntities(id);
    return eg.toJSON();
}

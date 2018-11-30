const fs = require('fs');
const path = require('path');
const { cloneEntityAndRelatedEntities } = require('./clone-entity');

console.log(cloneEntity());

function cloneEntity() {
    // command line arguments/inputs
    const jsonData = (() => {
        const filePath = path.join(__dirname, process.argv[2]);
        const data = JSON.parse(fs.readFileSync(`/${filePath}`));
        return data;
    })();
    const id = Number(process.argv[3]);

    return cloneEntityAndRelatedEntities(jsonData, id);
}

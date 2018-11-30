# Clone Entity
This script will take an input JSON file (of entities and links) and an entityid, and clones the given entity and all its related entities. It will output to standard output the combined collection of entities and links as valid JSON.

### Usage
This script requires node.js to run. Download that first!
1. Download or clone repo
2. Navigate to the folder from the commmand line
3. Enter 'npm start [JSONfile] [entityid]'. Make sure to enter the file path for the JSON file relative to the folder!
  
```
npm start examples/example.json 5
```

### To Test
This script uses Jest for unit testing.

```
npm test
```

const log = require('./index.js');
const fs = require('fs');

const scenario = fs.readFileSync('./backticked.txt', 'utf8');

// const scenario = "{ `abc '\"`: `test'\"`, 'key': 123}";

console.log(scenario);
gap();
log(scenario);

function gap() {
    console.log();
}

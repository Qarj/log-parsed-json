const log = require('./index.js');
const fs = require('fs');

// const scenarioObj = {
//     'abc \'"': 'test\'"',
//     'key': 123,
// };
// const inspected = require('util').inspect(scenarioObj, { depth: null, colors: true });
// console.log(inspected);

const scenario = fs.readFileSync('./singlequoted.txt', 'utf8');

console.log(scenario);
gap();
log(scenario);

function gap() {
    console.log();
}

const { log } = require('./index.js');

const scenario = `const { toString } = require('log-parsed-json');

    console.log(toString("{ 'k1': 'v1', 'k2': 123 }"));`;

console.log(scenario);
gap();
log(scenario);

function gap() {
    console.log();
}

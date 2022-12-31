const log = require('./index.js');

const scenario = `{ '"abc ': 'test' }`;

console.log(scenario);
gap();
log(scenario);

function gap() {
    console.log();
}

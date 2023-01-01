const { log } = require('./index.js');

const scenario = '{ "t": [], "a": {} }';

console.log(scenario);
gap();
log(scenario);

function gap() {
    console.log();
}

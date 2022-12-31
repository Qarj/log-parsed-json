const log = require('./index.js');
const fs = require('fs');

const scenario = "{ 'abc': 123, }";

console.log(scenario);
gap();
log(scenario);

function gap() {
    console.log();
}

const log = require('./index.js');

let obj = {};

console.log("{ test: 'test', array: ['test', { test: 'test' }] }");
log("{ test: 'test', array: ['test', { test: 'test' }] }");
gap();

function gap() {
    console.log();
}

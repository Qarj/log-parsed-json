const log = require('./index.js');

let obj = "text before { test: 'test', array: ['test', { test: 'test' }] } text after";

console.log(obj);
gap();
log(obj);

function gap() {
    console.log();
}

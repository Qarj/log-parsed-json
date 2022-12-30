const log = require('./index.js');

let obj = 'text { "test": "bad  { "test": "good" } some text';

console.log(obj);
gap();
log(obj);

function gap() {
    console.log();
}

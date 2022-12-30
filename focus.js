const log = require('./index.js');

let obj = 'real json {"value":["closing brace }"]}';

console.log(obj);
gap();
log(obj);

function gap() {
    console.log();
}

const log = require('./index.js');

let obj = 'real json {"value":["double quote \\"test\\""]}';

console.log(obj);
gap();
log(obj);

function gap() {
    console.log();
}

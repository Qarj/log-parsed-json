const log = require('./index.js');

let obj = '{  \r \t "test": \t "test", \r \r  "test2": 2 }';

console.log(obj);
gap();
log(obj);

function gap() {
    console.log();
}

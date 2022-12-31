const log = require('./index.js');

// let obj = 'text { "test": [ 1, 2, 3] } abc { "test": "good" } some text';
let obj = 'text { "test": [ 1, 2, 3] } abc ';

console.log(obj);
gap();
log(obj);

function gap() {
    console.log();
}

const myrex = /([0-9a-zA-Z-.])/;
const characterToTest = '2';
console.log(myrex.test(characterToTest));

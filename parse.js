const parse = require('./parseJson.js');

const obj = '{"}';
console.log(obj);
console.log(parse.toString(obj));

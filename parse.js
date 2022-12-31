const parse = require('./parseJson.js');

let obj = '{\t"test"\t: \t 123  \n }';
console.log(obj);
console.log(parse.toString(obj));

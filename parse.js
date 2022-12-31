const parse = require('./parseJson.js');
const fs = require('fs');
const scenario = fs.readFileSync('./singlequoted.txt', 'utf8');

// const scenario = `{ 'abc \'': 'test\'' }`;
console.log(scenario);
console.log(parse.toString(scenario));

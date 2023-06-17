const { log } = require('./index.js');
const util = require('util');

let scenario = `{
    headerCount: 1,
    savedJobs: [
        {
            id: '111',
            external: false,
        }, 
    ],
}`;

let scenario2 = `{ 
value: true peter: 'paul' number: 3, somekey: "some very long string that goes for a number of lines",
array: [ 2 9234 98234 9 9213840  098213409 98234]
}`;

console.log(scenario2);
gap();
log(scenario2);

function gap() {
    console.log();
}

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

console.log(scenario);
gap();
log(scenario);

function gap() {
    console.log();
}

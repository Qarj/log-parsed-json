const log = require('./index.js');
const fs = require('fs');

let special = JSON.stringify({ abc: 123, def: 'test', ghi: { jkl: 'test' } });
console.log(typeof special);
special = JSON.parse(special);
console.log(typeof special);

console.log('another');
let another = JSON.parse('  "abcd" ');
console.log(typeof another);

const someObject = {
    abc: 123,
    def: 'test',
    2: true,
    ghi: {
        'jkl': 'test',
        [null]: null,
        [undefined]: undefined,
        '': true,
        'result': '{"abc":123,"def":"test","ghi":{"jkl":"test"}}',
    },
};

const string = JSON.stringify(someObject, null, 2);

const object = {
    abc: 123,
    def: 'test',
    mystringy: string,
};

const nextLevel = JSON.stringify(
    {
        abc: 123,
        object: object,
    },
    null,
    2,
);

let scenario = JSON.stringify(nextLevel, null, 2);

// scenario = JSON.parse(scenario);
console.log(typeof scenario);

fs.writeFileSync('./stringifiedString.txt', scenario, 'utf8');

console.log(scenario);
gap();
log(scenario);

function gap() {
    console.log();
}

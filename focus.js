const log = require('./index.js');
const fs = require('fs');

const myObject = {
    abc: 123,
    def: 'test',
    ghi: {
        jkl: 'test',
    },
};

const someOtherObject = {
    zzz: 123,
    jj: 'test',
};

someOtherObject.abc = myObject;
myObject.xyz = someOtherObject;
let scenario = {
    abc: myObject,
    def: someOtherObject,
};

scenario = `{
    mykey: '{ "first": 123, "second": false, "3": null }',
    other: 12345
}
`;

console.log(scenario);
gap();
log(scenario);

function gap() {
    console.log();
}

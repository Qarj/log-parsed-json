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
    mykey: '{ "first": 123, "second": false, "four": null }',
    other: 12345
}    hey there!!
{
    yourkey: '{ "second": 234, "fifth": "{ five: 123 }", "88": false }',
    other: 55
}
`;

console.log(scenario);
gap();
log(scenario);

function gap() {
    console.log();
}

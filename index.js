const util = require('util');
const parseJson = require('./parseJson.js');

function main(object) {
    if (typeof object === 'number') return console.log(object);
    if (typeof object === 'boolean') return console.log(object);
    if (typeof object === 'object') {
        logPretty(object);
        return console.log();
    }

    const text = object;

    let array = parseJson.toArrayOfPlainStringsOrJson(text);
    for (const item of array) logPretty(item);
    console.log();
}

function logPretty(obj) {
    let jsonString = obj;
    try {
        if (typeof obj === 'string') jsonString = JSON.parse(obj);
        process.stdout.write(util.inspect(jsonString, { showHidden: false, depth: null, colors: true }));
    } catch (e) {
        process.stdout.write(obj);
    }
}

module.exports = main;

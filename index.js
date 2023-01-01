const util = require('util');
const parseJson = require('./parseJson.js');

function log(object) {
    if (typeof object === 'number') return console.log(object);
    if (typeof object === 'boolean') return console.log(object);
    if (typeof object === 'object') {
        logPretty(object);
        return console.log();
    }

    logJsons(object);
}

function logJsons(text) {
    let array = parseJson.toArrayOfPlainStringsOrJson(text);
    for (const item of array) {
        logPretty(item);
        if (isJson(item)) logJsonsInJson(item);
    }
    console.log();
}

function logJsonsInJson(item) {
    const object = JSON.parse(item);

    for (const key in object) {
        if (object[key] && typeof object[key] === 'object') logJsonsInJson(JSON.stringify(object[key]));
        else if (parseJson.canParseJson(object[key])) {
            console.log(`\nFOUND JSON found in key ${key} --->`);
            logJsons(object[key]);
        }
    }
}

function isJson(text) {
    try {
        const result = JSON.parse(text);
        if (!result) return false;
        if (typeof result !== 'object') return false;
        return true;
    } catch (e) {
        return false;
    }
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

module.exports = { log, toString: parseJson.toString };

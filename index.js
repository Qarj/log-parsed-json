const util = require('util');
const ParseJson = require('./ParseJson.js');

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
    let array = toArrayOfPlainStringsOrJson(text);
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
        else if (canParseJson(object[key])) {
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

function repairJson(input) {
    const parseJson = new ParseJson(input);
    return parseJson.repairJson();
}

function toArrayOfPlainStringsOrJson(input) {
    const parseJson = new ParseJson(input);
    return parseJson.toArrayOfPlainStringsOrJson();
}

function canParseJson(input) {
    const parseJson = new ParseJson(input);
    try {
        parseJson.repairJson();
        return true;
    } catch (e) {
        return false;
    }
}

function firstJson(input) {
    const parseJson = new ParseJson(input);
    const result = parseJson.toArrayOfPlainStringsOrJson();
    for (item of result) if (canParseJson(item)) return item;
    return '';
}

function lastJson(input) {
    const parseJson = new ParseJson(input);
    const result = parseJson.toArrayOfPlainStringsOrJson();
    for (let i = result.length - 1; i >= 0; i--) if (canParseJson(result[i])) return result[i];
    return '';
}

function largestJson(input) {
    const parseJson = new ParseJson(input);
    const result = parseJson.toArrayOfPlainStringsOrJson();
    let largest = '';
    for (item of result) if (canParseJson(item) && item.length > largest.length) largest = item;
    return largest;
}

function jsonMatching(input, regex) {
    const parseJson = new ParseJson(input);
    const result = parseJson.toArrayOfPlainStringsOrJson();
    for (item of result) if (canParseJson(item) && regex.test(item)) return item;
    return '';
}

module.exports = {
    log,
    repairJson,
    toArrayOfPlainStringsOrJson,
    canParseJson,
    firstJson,
    lastJson,
    largestJson,
    jsonMatching,
};

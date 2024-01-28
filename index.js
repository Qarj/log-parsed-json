import util from 'util';
import ParseJson from './ParseJson.js';

export function log(object) {
    process.env.USE_INSPECT = '1';
    _log(object);
}

export function logAsJson(object) {
    process.env.USE_INSPECT = '';
    _log(object);
}

function _log(object) {
    if (typeof object === 'number') return console.log(object);
    if (typeof object === 'boolean') return console.log(object);
    if (typeof object === 'object') {
        logPretty(object);
        return console.log();
    }

    logJsons(object);
}

export function logJsons(text) {
    let array = toArrayOfPlainStringsOrJson(text);
    for (const item of array) {
        logPretty(item);
        if (isJson(item)) logJsonsInJson(item);
    }
    console.log();
}

export function logJsonsInJson(item) {
    const object = JSON.parse(item);

    for (const key in object) {
        if (object[key] && typeof object[key] === 'object') logJsonsInJson(JSON.stringify(object[key]));
        else if (object[key] && typeof object[key] === 'string') {
            logInnerJsons(object[key], key);
        }
    }
}

export function logInnerJsons(text, key) {
    let array = toArrayOfPlainStringsOrJson(text);
    let jsonFound = false;
    for (const item of array) {
        if (isJson(item)) jsonFound = true;
    }
    if (jsonFound) {
        console.log(`\nFOUND JSON in key ${key} --->`);
        for (const item of array) {
            logPretty(item);
            if (isJson(item)) logJsonsInJson(item);
        }
    }
}

export function isJson(text) {
    try {
        const result = JSON.parse(text);
        if (!result) return false;
        if (typeof result !== 'object') return false;
        return true;
    } catch (e) {
        return false;
    }
    // const result = repairJson('{ "number": 1.23e+20 }');
}

export function logPretty(obj) {
    if (!process.env.USE_INSPECT) return logPrettyJson(obj);
    let jsonString = obj;
    try {
        // console.log('using inspect');
        if (typeof obj === 'string') jsonString = JSON.parse(obj);
        process.stdout.write(util.inspect(jsonString, { showHidden: false, depth: null, colors: true }));
    } catch (e) {
        process.stdout.write(obj);
    }
}

export function logPrettyJson(obj) {
    let jsonString = obj;
    try {
        if (typeof obj === 'string') jsonString = JSON.parse(obj);
        process.stdout.write(JSON.stringify(jsonString, null, 4));
    } catch (e) {
        process.stdout.write(obj);
    }
}

export function repairJson(input) {
    const parseJson = new ParseJson(input);
    return parseJson.repairJson();
}

export function toArrayOfPlainStringsOrJson(input) {
    const parseJson = new ParseJson(input);
    return parseJson.toArrayOfPlainStringsOrJson();
}

export function canParseJson(input) {
    const parseJson = new ParseJson(input);
    try {
        parseJson.repairJson();
        return true;
    } catch (e) {
        return false;
    }
}

export function firstJson(input) {
    const parseJson = new ParseJson(input);
    const result = parseJson.toArrayOfPlainStringsOrJson();
    for (const item of result) if (canParseJson(item)) return item;
    return '';
}

export function lastJson(input) {
    const parseJson = new ParseJson(input);
    const result = parseJson.toArrayOfPlainStringsOrJson();
    for (let i = result.length - 1; i >= 0; i--) if (canParseJson(result[i])) return result[i];
    return '';
}

export function largestJson(input) {
    const parseJson = new ParseJson(input);
    const result = parseJson.toArrayOfPlainStringsOrJson();
    let largest = '';
    for (const item of result) if (canParseJson(item) && item.length > largest.length) largest = item;
    return largest;
}

export function jsonMatching(input, regex) {
    const parseJson = new ParseJson(input);
    const result = parseJson.toArrayOfPlainStringsOrJson();
    for (const item of result) if (canParseJson(item) && regex.test(item)) return item;
    return '';
}

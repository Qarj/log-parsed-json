const util = require('util');

function main(object) {
    if (typeof object === 'object') {
        logPretty(object);
        return console.log();
    }

    const text = getStringFromObject(object);

    let eatingJson = false;
    let jsonString = '';
    let eatingPlainText = true;
    let plainText = '';
    let leftBraceCount = 0;
    let rightBraceCount = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (eatingPlainText) {
            if (char === '{') {
                eatingPlainText = false;
                process.stdout.write(plainText);
                plainText = '';
                eatingJson = true;
            } else {
                plainText += char;
            }
        }
        if (eatingJson) {
            jsonString += char;
            if (char === '{') leftBraceCount++;
            if (char === '}') rightBraceCount++;
            if (leftBraceCount === rightBraceCount) {
                eatingJson = false;
                eatingPlainText = true;
                logPretty(jsonString);
                jsonString = '';
                leftBraceCount = 0;
                rightBraceCount = 0;
            }
        }
    }

    const final = plainText + jsonString;
    if (final.length > 0) console.log(final);
}

function getStringFromObject(object) {
    if (typeof object === 'string') return object;
    if (typeof object === 'number') return object.toString();
    if (typeof object === 'boolean') return object.toString();
    return util.inspect(object, { showHidden: false, depth: null, colors: false });
}

function logPretty(obj) {
    let jsonString = obj;
    try {
        if (typeof obj === 'string') jsonString = JSON.parse(obj);
        process.stdout.write(util.inspect(jsonString, { showHidden: false, depth: null, colors: true }));
    } catch (e) {
        console.log(obj);
    }
}

module.exports = main;

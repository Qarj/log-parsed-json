let position;
let inspected;
let quoted;
let debug = false;
let checkpoint;
let checkpointQuoted;
let quotedLastCommaPosition;

function canParseJson(text) {
    try {
        toString(text);
        return true;
    } catch (e) {
        return false;
    }
}

function setCheckpoint() {
    if (debug) console.log('setCheckpoint', position, inspected[position]);
    checkpoint = position;
    checkpointQuoted = quoted;
}

function toString(string) {
    debugInfo(string);
    string = deStringify(string);
    inspected = string;
    position = 0;
    checkpoint = 0;
    checkpointQuoted = '';
    quoted = '';
    eatObject();
    return quoted;
}

function deStringify(string) {
    try {
        const result = JSON.parse(string);
        if (typeof result === 'string') return deStringify(result);
        return string;
    } catch (e) {
        return string;
    }
}

function debugInfo(string) {
    if (debug && string.length < 100) {
        console.log(string);
        for (let i = 0; i < string.length; i += 10) process.stdout.write(' '.repeat(10) + '|');
        console.log();
    }
}

function toArrayOfPlainStringsOrJson(string) {
    debugInfo(string);
    string = deStringify(string);
    const result = [];
    inspected = string;
    position = 0;
    checkpoint = 0;
    checkpointQuoted = '';
    while (position < inspected.length) {
        quoted = '';
        eatPlainText();
        result.push(quoted);
        quoted = '';
        if (position >= inspected.length) break;
        if (inspected[position] === '{') {
            try {
                eatObject();
            } catch (e) {
                if (debug) console.log('error root eat object', e, position, inspected[position]);
                quoted = checkpointQuoted;
                position = checkpoint;
            }
        }

        result.push(quoted);
    }

    return result;
}

function eatPlainText() {
    while (inspected[position] !== '{' && position < inspected.length) {
        quoted += inspected[position];
        position++;
    }
}

function eatObject() {
    if (debug) console.log('eatObject', position, inspected[position]);
    eatWhitespace();
    eatOpenBrace();
    eatKeyValuePairs();
    eatWhitespace();
    eatCloseBrace();
}

function eatKeyValuePairs() {
    let morePairs = true;
    let pairsEaten = 0;
    quotedLastCommaPosition = undefined;
    while (morePairs) {
        if (debug) console.log('eatKeyValuePairs', position, inspected[position]);
        eatWhitespace();
        if (inspected[position] === '}') {
            if (quotedLastCommaPosition)
                quoted = quoted.slice(0, quotedLastCommaPosition) + quoted.slice(quotedLastCommaPosition + 1);
            quotedLastCommaPosition = undefined;
            break;
        }
        eatKey();
        eatWhitespace();
        eatColon();
        eatWhitespace();
        eatReferenceOptional();
        eatWhitespace();
        eatValue();
        eatWhitespace();
        morePairs = eatCommaPostValueInObjectOptional();
        pairsEaten++;
    }
}

function eatReferenceOptional() {
    if (inspected[position] === '<') {
        eatReference();
    }
}

function eatReference() {
    if (debug) console.log('eatReference', position, inspected[position]);
    setCheckpoint();
    eatOpenAngleBracket();
    eatWhitespace();
    eatRef();
    eatWhitespace();
    eatAsterisk();
    eatWhitespace();
    eatNumber();
    eatWhitespace();
    eatCloseAngleBracket();
}

function eatOpenAngleBracket() {
    if (inspected[position] !== '<') throw new Error('Expected open angle bracket');
    position++;
}

function eatRef() {
    if (inspected[position] !== 'r') throw new Error('Expected r');
    position++;
    if (inspected[position] !== 'e') throw new Error('Expected e');
    position++;
    if (inspected[position] !== 'f') throw new Error('Expected f');
    position++;
}

function eatAsterisk() {
    if (inspected[position] !== '*') throw new Error('Expected asterisk');
    position++;
}

function eatNumber() {
    if (debug) console.log('eatNumber', position, inspected[position]);
    const numberRegex = /[0-9]/;
    while (numberRegex.test(inspected[position])) {
        position++;
    }
}

function eatCloseAngleBracket() {
    if (inspected[position] !== '>') throw new Error('Expected close angle bracket');
    position++;
}

function eatCommaPostValueInObjectOptional() {
    if (inspected[position] === ',') {
        eatComma();
        return true;
    }
    return false;
}

function eatWhitespace() {
    const whitespaceRegex = /\s/;
    while (whitespaceRegex.test(inspected[position])) {
        quoted += inspected[position];
        position++;
    }
}

function eatOpenBrace() {
    if (inspected[position] !== '{') throw new Error('Expected open brace');
    quoted += inspected[position];
    position++;
}

function eatCloseBrace() {
    if (debug) console.log('eatCloseBrace', position, inspected[position]);
    if (inspected[position] !== '}') throw new Error('Expected close brace');
    quoted += inspected[position];
    position++;
}

function eatKey() {
    if (inspected[position] === "'" || inspected[position] === '"' || inspected[position] === '`') {
        eatQuotedKey();
    } else {
        eatUnquotedKey();
    }
}

function eatQuotedKey() {
    if (debug) console.log('eatQuotedKey', position, inspected[position]);
    setCheckpoint();
    throwIfJsonSpecialCharacter(inspected[position]);
    const quote = inspected[position];
    quoted += '"';
    position++;
    while (inspected[position] !== quote) {
        eatCharOrEscapedChar(quote);
    }
    if (debug) console.log('eatQuotedKey end', position, inspected[position]);
    quoted += '"';
    position++;
}

function eatUnquotedKey() {
    if (debug) console.log('eatUnquotedKey', position, inspected[position]);
    setCheckpoint();
    throwIfJsonSpecialCharacter(inspected[position]);
    quoted += '"';
    while (inspected[position] !== ':' && inspected[position] !== ' ') {
        quoted += inspected[position];
        position++;
    }
    quoted += '"';
}

function throwIfJsonSpecialCharacter(char) {
    if (char === '{' || char === '}' || char === '[' || char === ']' || char === ':' || char === ',') {
        throw new Error(`Unexpected character ${char} at position ${position}`);
    }
}

function eatColon() {
    if (inspected[position] !== ':') throw new Error('Expected colon');
    quoted += inspected[position];
    position++;
}

function eatValue() {
    if (debug) console.log('eatValue', position, inspected[position]);
    if (inspected[position] === '{') {
        eatObject();
    } else if (inspected[position] === "'" || inspected[position] === '"' || inspected[position] === '`') {
        eatString();
    } else if (inspected[position] === '[') {
        eatArray();
    } else {
        eatPrimitive();
    }
}

function eatString() {
    setCheckpoint();
    if (debug) console.log('eatString', position, inspected[position]);
    let quote = inspected[position];
    quoted += '"';
    position++;
    while (inspected[position] !== quote) {
        eatCharOrEscapedChar(quote);
    }
    quoted += '"';
    position++;
}

function eatCharOrEscapedChar(quote) {
    if (debug) console.log('eatCharOrEscapedChar', position, inspected[position]);
    if (position >= inspected.length) throw new Error('Unexpected end of quoted key or string');
    if (inspected[position] === '\\') {
        if (debug) console.log('eatCharOrEscapedChar escape', position, inspected[position]);
        if ((quote === "'" || quote === '`') && inspected[position + 1] === quote) {
            if (debug) console.log('eatCharOrEscapedChar unescape single quote', position, inspected[position]);
        } else quoted += inspected[position];
        position++;
    }
    if ((quote === "'" || quote === '`') && inspected[position] === '"') quoted += '\\';
    quoted += inspected[position];
    position++;
}

function eatArray() {
    if (debug) console.log('eatArray', position, inspected[position]);
    if (inspected[position] !== '[') throw new Error('Expected array');
    quoted += inspected[position];
    position++;
    let moreValues = true;
    while (moreValues) {
        eatWhitespace();
        eatCircularOptional();
        eatValue();
        // moreValues = eatCommaOptional();
        moreValues = eatCommaOrCloseBracket();
        eatWhitespace();
    }
    // eatCloseBracket();
}

function eatCircularOptional() {
    if (
        inspected[position] === 'C' &&
        inspected[position + 1] === 'i' &&
        inspected[position + 2] === 'r' &&
        inspected[position + 3] === 'c' &&
        inspected[position + 4] === 'u' &&
        inspected[position + 5] === 'l' &&
        inspected[position + 6] === 'a' &&
        inspected[position + 7] === 'r'
    ) {
        eatCircular();
    }
}

function eatCircular() {
    if (debug) console.log('eatCircular', position, inspected[position]);
    const testRegex = /[Circular *\d]/;
    while (testRegex.test(inspected[position])) {
        position++;
    }
    quoted += '"Circular"';
}

function eatCommaOrCloseBracket() {
    if (inspected[position] === ',') {
        return eatComma();
    } else if (inspected[position] === ']') {
        return eatCloseBracket();
    } else {
        throw new Error('Expected comma or close bracket');
    }
}

function eatComma() {
    if (debug) console.log('eatComma', position, inspected[position]);
    if (inspected[position] !== ',') throw new Error('Expected comma');
    quoted += inspected[position];
    quotedLastCommaPosition = quoted.length - 1;
    position++;
    return true;
}

function eatCloseBracket() {
    if (debug) console.log('eatCloseBracket', position, inspected[position]);
    if (inspected[position] !== ']') throw new Error('Expected close bracket');
    quoted += inspected[position];
    position++;
    return false;
}

function eatPrimitive() {
    setCheckpoint();
    if (debug) console.log('eatPrimitive', position, inspected[position]);
    if (
        inspected[position].toLowerCase() === 'n' &&
        inspected[position + 1].toLowerCase() === 'o' &&
        inspected[position + 2].toLowerCase() === 'n' &&
        inspected[position + 3].toLowerCase() === 'e'
    )
        return eatNone();

    const primitiveRegex = /([0-9a-zA-Z-.])/;
    while (primitiveRegex.test(inspected[position])) {
        quoted += inspected[position];
        position++;
    }
}

function eatNone() {
    if (debug) console.log('eatNone', position, inspected[position]);
    quoted += 'null';
    position += 4;
}

module.exports = { toString, toArrayOfPlainStringsOrJson, canParseJson };

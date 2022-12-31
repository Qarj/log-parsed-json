let position;
let inspected;
let quoted;
let debug = false;
let checkpoint;
let checkpointQuoted;

function getCheckpoint() {
    return checkpoint;
}

function setCheckpoint() {
    if (debug) console.log('setCheckpoint', position, inspected[position]);
    checkpoint = position;
    checkpointQuoted = quoted;
}

function setPosition(newPosition) {
    position = newPosition;
}

function toString(string) {
    inspected = string;
    position = 0;
    checkpoint = 0;
    checkpointQuoted = '';
    quoted = '';
    eatObject();
    return quoted;
}

function toArrayOfPlainStringsOrJson(string) {
    if (debug && string.length < 100) {
        console.log(string);
        for (let i = 0; i < string.length; i += 10) process.stdout.write(' '.repeat(10) + '|');
        console.log();
    }

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
    while (morePairs) {
        if (debug) console.log('eatKeyValuePairs', position, inspected[position]);
        eatWhitespace();
        eatKey();
        eatColon();
        eatWhitespace();
        eatValue();
        eatWhitespace();
        morePairs = eatCommaOptional();
    }
}

function eatWhitespace() {
    while (inspected[position] === ' ' || inspected[position] === '\n') {
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
    if (inspected[position] === "'" || inspected[position] === '"') {
        eatQuotedKey();
    } else {
        eatUnquotedKey();
    }
}

function eatQuotedKey() {
    if (debug) console.log('eatQuotedKey', position, inspected[position]);
    const quote = inspected[position];
    quoted += '"';
    position++;
    while (inspected[position] !== quote) {
        quoted += inspected[position];
        position++;
    }
    quoted += '"';
    position++;
}

function eatUnquotedKey() {
    if (debug) console.log('eatUnquotedKey', position, inspected[position]);
    setCheckpoint();
    throwIfJsonSpecialCharacter(inspected[position]);
    quoted += '"';
    while (inspected[position] !== ':') {
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
    } else if (inspected[position] === "'" || inspected[position] === '"') {
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
        eatCharOrEscapedChar();
    }
    quoted += '"';
    position++;
}

function eatCharOrEscapedChar() {
    if (inspected[position] === '\\') {
        quoted += inspected[position];
        position++;
    }
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
        eatValue();
        moreValues = eatCommaOptional();
        eatWhitespace();
    }
    eatCloseBracket();
}

function eatCloseBracket() {
    if (debug) console.log('eatCloseBracket', position, inspected[position]);
    if (inspected[position] !== ']') throw new Error('Expected close bracket');
    quoted += inspected[position];
    position++;
}

function eatPrimitive() {
    setCheckpoint();
    if (debug) console.log('eatPrimitive', position, inspected[position]);
    const primitiveRegex = /([0-9a-zA-Z-.])/;
    while (primitiveRegex.test(inspected[position])) {
        quoted += inspected[position];
        position++;
    }
}

function eatCommaOptional() {
    if (inspected[position] === ',') {
        eatComma();
        return true;
    }
    return false;
}

function eatComma() {
    if (debug) console.log('eatComma', position, inspected[position]);
    if (inspected[position] !== ',') throw new Error('Expected comma');
    quoted += inspected[position];
    position++;
}

module.exports = { getCheckpoint, setPosition, toString, toArrayOfPlainStringsOrJson };

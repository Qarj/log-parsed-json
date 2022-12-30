let position;
let inspected;
let quoted;
let debug = false;

function toString(string) {
    inspected = string;
    position = 0;
    quoted = '';
    eatObject();
    return quoted;
}

function toArrayOfPlainStringsOrJson(string) {
    const result = [];
    inspected = string;
    position = 0;
    while (position < inspected.length) {
        quoted = '';
        eatPlainText();
        result.push(quoted);
        quoted = '';
        if (position >= inspected.length) break;
        if (inspected[position] === '{') eatObject();
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
    if (inspected[position] === "'") {
        eatQuotedKey();
    } else {
        eatUnquotedKey();
    }
}

function eatQuotedKey() {
    if (inspected[position] !== "'") throw new Error('Expected key');
    quoted += '"';
    position++;
    while (inspected[position] !== "'") {
        quoted += inspected[position];
        position++;
    }
    quoted += '"';
    position++;
}

function eatUnquotedKey() {
    quoted += '"';
    while (inspected[position] !== ':') {
        quoted += inspected[position];
        position++;
    }
    quoted += '"';
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
    } else if (inspected[position] === "'") {
        eatString();
    } else if (inspected[position] === '[') {
        eatArray();
    } else {
        eatPrimitive();
    }
}

function eatString() {
    if (debug) console.log('eatString', position, inspected[position]);
    if (inspected[position] !== "'") throw new Error('Expected string');
    quoted += '"';
    position++;
    while (inspected[position] !== "'") {
        quoted += inspected[position];
        position++;
    }
    quoted += '"';
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
    if (debug) console.log('eatPrimitive', position, inspected[position]);
    while (inspected[position] !== ',' && inspected[position] !== '}' && inspected[position] !== ']') {
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

module.exports = { toString, toArrayOfPlainStringsOrJson };

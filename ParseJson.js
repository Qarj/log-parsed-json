/* eslint-disable no-constant-condition */
/* eslint-disable no-empty */
class ParseJson {
    constructor(input, options) {
        this.attemptRepairOfMismatchedQuotes = false;
        if (options.attemptRepairOfMismatchedQuotes) this.attemptRepairOfMismatchedQuotes = true;
        this.debugInfo(input);
        this.inspected = this.deStringify(input);
        this.resetPointer();
        this.debug = false;
    }

    resetPointer() {
        this.position = 0;
        this.quoted = [];
        this.checkpoint = 0;
        this.checkpointQuoted = '';
        this.quotedLastCommaPosition = undefined;
    }

    setCheckpoint() {
        this.log('setCheckpoint');
        this.checkpoint = this.position;
        this.checkpointQuoted = this.quoted;
    }

    repairJson() {
        this.resetPointer();
        this.eatObject();
        return this.quoted.join('');
    }

    deStringify(string) {
        try {
            const result = JSON.parse(string);
            if (typeof result === 'string') return this.deStringify(result);
        } catch (e) {}
        return string;
    }

    debugInfo(string) {
        if (this.debug && string.length < 100) {
            console.log(string);
            for (let i = 0; i < string.length; i += 10) process.stdout.write(' '.repeat(10) + '|');
            console.log();
        }
    }

    toArrayOfPlainStringsOrJson() {
        const result = [];
        this.resetPointer();
        let recoveryPosition = 0;
        while (this.position < this.inspected.length) {
            this.quoted = [];
            this.eatPlainText();
            result.push(this.quoted.join(''));
            this.quoted = [];
            if (this.position >= this.inspected.length) break;
            if (this.inspected[this.position] === '{') {
                recoveryPosition = this.position + 1;

                try {
                    this.eatObject();
                } catch (e) {
                    if (this.debug)
                        console.log('error root eat object', e, this.position, this.inspected[this.position]);
                    this.quoted.push['{'];
                    this.position = recoveryPosition;
                }
            }

            result.push(this.quoted.join(''));
        }

        return result;
    }

    eatPlainText() {
        const { inspected } = this;
        while (inspected[this.position] !== '{' && this.position < inspected.length) {
            this.quoted.push(inspected[this.position]);
            this.position++;
        }
    }

    eatObject() {
        this.log('eatObject');
        this.eatWhitespace();
        this.eatOpenBrace();
        this.eatKeyValuePairs();
        this.eatWhitespace();
        this.eatCloseBrace();
    }

    eatKeyValuePairs() {
        while (true) {
            this.log('eatKeyValuePairs');
            this.eatWhitespace();
            if (this.inspected[this.position] === '}') {
                this.removeTrailingCommaIfPresent();
                break;
            }
            this.quotedLastCommaPosition = undefined;
            this.eatKey();
            this.eatWhitespace();
            this.eatColon();
            this.eatWhitespace();
            this.eatReferenceOptional();
            this.eatWhitespace();
            this.eatValue();
            this.quotedLastCommaPosition = undefined;
            this.eatWhitespace();

            if (this.inspected[this.position] === ',') {
                this.eatComma();
            } else if (this.inspected[this.position] !== '}') {
                this.quoted.push(', '); // Insert missing comma
            }
        }
    }

    eatReferenceOptional() {
        if (this.inspected[this.position] === '<') {
            this.eatReference();
        }
    }

    eatReference() {
        this.log('eatReference');
        this.setCheckpoint();
        this.eatOpenAngleBracket();
        this.eatWhitespace();
        this.eatRef();
        this.eatWhitespace();
        this.eatAsterisk();
        this.eatWhitespace();
        this.eatReferenceNumber();
        this.eatWhitespace();
        this.eatCloseAngleBracket();
    }

    eatOpenAngleBracket() {
        if (this.inspected[this.position] !== '<') throw new Error('Expected open angle bracket');
        this.position++;
    }

    eatRef() {
        if (this.inspected[this.position] !== 'r') throw new Error('Expected r');
        this.position++;
        if (this.inspected[this.position] !== 'e') throw new Error('Expected e');
        this.position++;
        if (this.inspected[this.position] !== 'f') throw new Error('Expected f');
        this.position++;
    }

    eatAsterisk() {
        if (this.inspected[this.position] !== '*') throw new Error('Expected asterisk');
        this.position++;
    }

    eatReferenceNumber() {
        this.log('eatReferenceNumber');
        const numberRegex = /[0-9]/;
        while (numberRegex.test(this.inspected[this.position])) {
            this.position++;
        }
    }

    eatCloseAngleBracket() {
        if (this.inspected[this.position] !== '>') throw new Error('Expected close angle bracket');
        this.position++;
    }

    eatCommaPostValueOptional() {
        if (this.inspected[this.position] === ',') {
            this.eatComma();
            return true;
        }
        return false;
    }

    eatWhitespace() {
        const whitespaceRegex = /\s/;
        while (whitespaceRegex.test(this.inspected[this.position])) {
            this.position++;
        }
    }

    eatOpenBrace() {
        if (this.inspected[this.position] !== '{') throw new Error('Expected open brace');
        this.quoted.push(this.inspected[this.position], ' ');
        this.position++;
    }

    eatCloseBrace() {
        this.log('eatCloseBrace');
        if (this.inspected[this.position] !== '}') throw new Error('Expected close brace');
        this.quoted.push(' ', this.inspected[this.position]);
        this.position++;
    }

    eatKey() {
        if (this.getQuote()) this.eatQuotedKey();
        else this.eatUnquotedKey();
    }

    getQuote() {
        const { inspected, position } = this;
        if (inspected[position] === "'") return "'";
        if (inspected[position] === '"') return '"';
        if (inspected[position] === '`') return '`';
        if (inspected[position] === '“') return '”';
        if (inspected[position] === '”') return '“';
        if (inspected[position] === '\\' && inspected[position + 1] === '"') return '\\"';
        if (inspected[position] === '\\' && inspected[position + 1] === '\\' && inspected[position + 2] === '"')
            return '\\\\"';
        return false;
    }

    checkQuote(quote) {
        const { inspected, position } = this;
        if (quote.length === 2) return inspected[position] === quote[0] && inspected[position + 1] === quote[1];
        if (quote.length === 3)
            return (
                inspected[position] === quote[0] &&
                inspected[position + 1] === quote[1] &&
                inspected[position + 2] === quote[2]
            );
        if (this.attemptRepairOfMismatchedQuotes) {
            return (
                inspected[position] === "'" ||
                inspected[position] === '"' ||
                inspected[position] === '`' ||
                inspected[position] === '”' ||
                inspected[position] === '“'
            );
        }
        if (quote.length === 1) return inspected[position] === quote;
        return false;
    }

    eatLongQuote(quote) {
        const eatExtra = quote.length - 1;
        for (let i = 0; i < eatExtra; i++) {
            if (this.debug) console.log('eatLongQuote', this.position, this.inspected[this.position]);
            this.position++;
        }
    }

    eatExtraStartingKeyDoubleQuote(quote) {
        if (quote !== '"') return;
        const { inspected, position } = this;
        if (inspected[position] === '"') {
            const virtualPosition = this.eatVirtualWhiteSpace(this.position + 1);
            if (this.inspected[virtualPosition] == ':') return;
            this.log('eatExtraStartingKeyDoubleQuote');
            this.position++;
        }
    }

    eatQuotedKey() {
        this.log('eatQuotedKey');
        this.setCheckpoint();
        this.throwIfJsonSpecialCharacter(this.inspected[this.position]);
        const quote = this.getQuote();
        this.quoted.push('"');
        this.position++;
        this.eatLongQuote(quote);
        this.eatExtraStartingKeyDoubleQuote(quote);
        while (!this.checkQuote(quote)) {
            this.eatCharOrEscapedChar(quote);
        }
        this.log('eatQuotedKey end');
        this.quoted.push('"');
        this.position++;
        this.eatLongQuote(quote);
    }

    eatUnquotedKey() {
        this.log('eatUnquotedKey');
        this.setCheckpoint();
        if (this.inspected[this.position] === '[') return this.eatNullKey();
        this.throwIfJsonSpecialCharacter(this.inspected[this.position]);
        this.quoted.push('"');
        while (this.inspected[this.position] !== ':' && this.inspected[this.position] !== ' ') {
            this.log('eatUnquotedKey loop');
            if (this.getQuote()) throw new Error('Unexpected quote in unquoted key');
            this.quoted.push(this.inspected[this.position]);
            this.position++;
        }
        this.quoted.push('"');
    }

    eatNullKey() {
        const { inspected } = this;
        this.log('eatNullKey');
        if (inspected[this.position] !== '[') throw new Error('Expected open bracket');
        this.position++;
        if (inspected[this.position].toLowerCase() !== 'n') throw new Error('Expected n');
        this.position++;
        if (inspected[this.position].toLowerCase() !== 'u') throw new Error('Expected u');
        this.position++;
        if (inspected[this.position].toLowerCase() !== 'l') throw new Error('Expected l');
        this.position++;
        if (inspected[this.position].toLowerCase() !== 'l') throw new Error('Expected l');
        this.position++;
        if (inspected[this.position] !== ']') throw new Error('Expected close bracket');
        this.position++;
        this.quoted.push('"null"');
    }

    throwIfJsonSpecialCharacter(char) {
        if (char === '{' || char === '}' || char === '[' || char === ']' || char === ':' || char === ',') {
            throw new Error(`Unexpected character ${char} at position ${this.position}`);
        }
    }

    eatColon() {
        this.log('eatColon');
        if (this.inspected[this.position] !== ':') throw new Error('Expected colon');
        this.quoted.push(this.inspected[this.position], ' ');
        this.position++;
    }

    eatValue() {
        this.log('eatValue');
        switch (this.inspected[this.position]) {
            case '{':
                this.eatObject();
                break;
            case '[':
                this.eatArray();
                break;
            default:
                if (this.getQuote()) {
                    this.eatString();
                    this.eatConcatenatedStrings();
                } else {
                    this.eatPrimitive();
                }
        }
    }

    eatString() {
        this.setCheckpoint();
        this.log('eatString');
        this.quoted.push('"');
        this.eatStringCore();
    }

    eatConcatenatedStrings() {
        const virtualPosition = this.eatVirtualWhiteSpace(this.position + 1);
        if (this.inspected[virtualPosition] !== '+') return;
        this.log('eatConcatenatedStrings');

        this.position = virtualPosition + 1;
        this.eatWhitespace();
        this.quoted.pop(); // remove last quote

        this.eatStringCore();

        this.eatConcatenatedStrings();
    }

    eatStringCore() {
        let quote = this.getQuote();
        if (this.debug) console.log('quote', quote);
        this.position++;
        this.eatLongQuote(quote);
        while (!this.isEndQuoteMakingAllowanceForUnescapedSingleQuote(quote)) {
            this.eatCharOrEscapedChar(quote);
        }
        this.log('eatString end');
        this.quoted.push('"');
        this.position++;
        this.eatLongQuote(quote);
    }

    isEndQuoteMakingAllowanceForUnescapedSingleQuote(quote) {
        if (quote !== "'") return this.checkQuote(quote);
        try {
            if (this.checkQuote(quote) && this.inspected[this.position + 1] === 's') return false;
        } catch {}
        return this.checkQuote(quote);
    }

    eatVirtualWhiteSpace(virtualPosition) {
        const whitespaceRegex = /\s/;
        while (whitespaceRegex.test(this.inspected[virtualPosition])) {
            virtualPosition++;
        }
        return virtualPosition;
    }

    isDoubleEscapedDoubleQuote() {
        const { position, inspected } = this;
        if (position + 2 >= inspected.length) return false;
        return inspected[position] === '\\' && inspected[position + 1] === '\\' && inspected[position + 2] === '"';
    }

    isTripleEscapedDoubleQuote() {
        const { position, inspected } = this;
        if (position + 3 >= inspected.length) return false;
        return (
            inspected[position] === '\\' &&
            inspected[position + 1] === '\\' &&
            inspected[position + 2] === '\\' &&
            inspected[position + 3] === '"'
        );
    }

    eatCharOrEscapedChar(quote) {
        const { debug, inspected, quoted } = this;
        if (this.position >= inspected.length) throw new Error('Unexpected end of quoted key or string');
        if (debug)
            console.log(
                'eatCharOrEscapedChar',
                this.position,
                inspected[this.position],
                ' ' + inspected[this.position].charCodeAt(0),
            );
        if (inspected[this.position] === '\\' && !this.checkQuote(quote)) {
            this.log('eatCharOrEscapedChar escape');
            if (this.isTripleEscapedDoubleQuote()) {
                this.log('eatCharOrEscapedChar unescape triple escaped double quote', this.position);
                this.position++;
                this.position++;
            }
            if (this.isDoubleEscapedDoubleQuote()) {
                this.log('eatCharOrEscapedChar unescape double escaped double quote', this.position);
                this.position++;
            }
            if ((quote === "'" || quote === '`') && inspected[this.position + 1] === quote) {
                this.log('eatCharOrEscapedChar unescape single quote');
            } else quoted.push(inspected[this.position]);
            this.position++;
        }
        if ((quote === "'" || quote === '`') && inspected[this.position] === '"') quoted.push('\\');
        if (inspected[this.position] === '\n') {
            this.log('eatCharOrEscapedChar unescaped newline');
            quoted.push('\\n');
        } else {
            quoted.push(inspected[this.position]);
        }
        this.position++;
    }

    eatArray() {
        this.log('eatArray');
        if (this.inspected[this.position] !== '[') throw new Error('Expected array');
        this.quoted.push(this.inspected[this.position]);
        this.position++;

        while (true) {
            this.eatWhitespace();
            this.eatCircularOptional();
            if (this.inspected[this.position] === ']') {
                this.removeTrailingCommaIfPresent();
                break;
            }
            this.quotedLastCommaPosition = undefined;
            this.eatValue();
            this.eatWhitespace();

            if (this.inspected[this.position] === ',') {
                this.eatComma();
            } else if (this.inspected[this.position] !== ']') {
                this.quoted.push(', '); // Insert missing comma
            }
        }
        this.eatCloseBracket();
    }

    removeTrailingCommaIfPresent() {
        if (this.quotedLastCommaPosition !== undefined) {
            this.quoted.splice(this.quotedLastCommaPosition, 2);
        }
        this.quotedLastCommaPosition = undefined;
    }

    eatCircularOptional() {
        const { position, inspected } = this;
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
            this.eatCircular();
        }
    }

    eatCircular() {
        this.log('eatCircular');
        const testRegex = /[Circular *\d]/;
        while (testRegex.test(this.inspected[this.position])) {
            this.log('eatCircular loop');
            this.position++;
        }
        this.quoted.push('"Circular"');
    }

    eatComma() {
        this.log('eatComma');
        if (this.inspected[this.position] !== ',') throw new Error('Expected comma');
        this.quoted.push(this.inspected[this.position], ' ');
        this.quotedLastCommaPosition = this.quoted.length - 2;
        this.position++;
        return true;
    }

    eatCloseBracket() {
        this.log('eatCloseBracket');
        if (this.inspected[this.position] !== ']') throw new Error('Expected close bracket');
        this.quoted.push(this.inspected[this.position]);
        this.position++;
        return false;
    }

    eatPrimitive() {
        const { debug, inspected, position } = this;
        this.setCheckpoint();
        if (debug) console.log('eatPrimitive', position, inspected[position]);

        const lowerChar = inspected[position].toLowerCase();
        if (lowerChar === 'f' || lowerChar === 't' || lowerChar === 'n') {
            this.eatKeyword();
        } else if (this.isNumberStartChar(lowerChar)) {
            this.eatNumber();
        } else {
            throw new Error('Primitive not recognized, must start with f, t, n, or be numeric');
        }
    }

    isNumberStartChar(char) {
        return char && /[-0-9]/.test(char);
    }

    eatKeyword() {
        const { inspected, position } = this;
        const lowerSubstring = inspected.substring(position, position + 5).toLowerCase();

        if (lowerSubstring.startsWith('false')) {
            this.log('eatFalse');
            this.quoted.push('false');
            this.position += 5;
        } else if (lowerSubstring.startsWith('true')) {
            this.log('eatTrue');
            this.quoted.push('true');
            this.position += 4;
        } else if (lowerSubstring.startsWith('none') || lowerSubstring.startsWith('null')) {
            this.log('eatNull');
            this.quoted.push('null');
            this.position += 4;
        } else {
            throw new Error('Keyword not recognized, must be true, false, null or none');
        }
    }

    eatNumber() {
        const { inspected } = this;
        let numberStr = '';

        this.log('eatNumber');

        while (this.isNumberChar(inspected[this.position])) {
            numberStr += inspected[this.position];
            this.position++;
        }

        numberStr = numberStr.toLowerCase();

        let checkStr = numberStr;
        if (checkStr.startsWith('-')) checkStr = checkStr.substring(1);

        if (checkStr.length > 1 && checkStr.startsWith('0') && !checkStr.startsWith('0.')) {
            throw new Error('Number cannot have redundant leading 0');
        }

        if (checkStr.endsWith('.')) throw new Error('Number cannot have trailing decimal point');

        if (checkStr.includes('.e') || checkStr.includes('.E')) {
            throw new Error('Number cannot have decimal point followed by exponent');
        }

        if (checkStr.endsWith('e') || checkStr.endsWith('E')) {
            throw new Error('Number cannot have trailing exponent');
        }

        if (checkStr.endsWith('-') || checkStr.endsWith('+')) {
            throw new Error('Number cannot have trailing sign');
        }

        this.quoted.push(numberStr);
    }

    isNumberChar(char) {
        return char && /[-+eE0-9.]/.test(char);
    }

    log(note) {
        if (this.debug) console.log(note, this.position, this.inspected[this.position]);
    }
}

module.exports = ParseJson;

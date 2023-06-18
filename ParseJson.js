class ParseJson {
    constructor(input) {
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
        if (this.debug) console.log('setCheckpoint', this.position, this.inspected[this.position]);
        this.checkpoint = this.position;
        this.checkpointQuoted = this.quoted;
    }

    toString() {
        this.resetPointer();
        this.eatObject();
        return this.quoted.join('');
    }

    deStringify(string) {
        try {
            const result = JSON.parse(string);
            if (typeof result === 'string') return this.deStringify(result);
            return string;
        } catch (e) {
            return string;
        }
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
        while (this.inspected[this.position] !== '{' && this.position < this.inspected.length) {
            this.quoted.push(this.inspected[this.position]);
            this.position++;
        }
    }

    eatObject() {
        if (this.debug) console.log('eatObject', this.position, this.inspected[this.position]);
        this.eatWhitespace();
        this.eatOpenBrace();
        this.eatKeyValuePairs();
        this.eatWhitespace();
        this.eatCloseBrace();
    }

    eatKeyValuePairs() {
        while (true) {
            if (this.debug) console.log('eatKeyValuePairs', this.position, this.inspected[this.position]);
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
        if (this.debug) console.log('eatReference', this.position, this.inspected[this.position]);
        this.setCheckpoint();
        this.eatOpenAngleBracket();
        this.eatWhitespace();
        this.eatRef();
        this.eatWhitespace();
        this.eatAsterisk();
        this.eatWhitespace();
        this.eatNumber();
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

    eatNumber() {
        if (this.debug) console.log('eatNumber', this.position, this.inspected[this.position]);
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
        if (this.debug) console.log('eatCloseBrace', this.position, this.inspected[this.position]);
        if (this.inspected[this.position] !== '}') throw new Error('Expected close brace');
        this.quoted.push(' ', this.inspected[this.position]);
        this.position++;
    }

    eatKey() {
        if (this.getQuote()) this.eatQuotedKey();
        else this.eatUnquotedKey();
    }

    getQuote() {
        if (this.inspected[this.position] === "'") return "'";
        if (this.inspected[this.position] === '"') return '"';
        if (this.inspected[this.position] === '`') return '`';
        if (this.inspected[this.position] === '“') return '”';
        if (this.inspected[this.position] === '\\' && this.inspected[this.position + 1] === '"') return '\\"';
        if (
            this.inspected[this.position] === '\\' &&
            this.inspected[this.position + 1] === '\\' &&
            this.inspected[this.position + 2] === '"'
        )
            return '\\\\"';
        return false;
    }

    checkQuote(quote) {
        if (quote.length === 1) return this.inspected[this.position] === quote;
        if (quote.length === 2)
            return this.inspected[this.position] === quote[0] && this.inspected[this.position + 1] === quote[1];
        if (quote.length === 3)
            return (
                this.inspected[this.position] === quote[0] &&
                this.inspected[this.position + 1] === quote[1] &&
                this.inspected[this.position + 2] === quote[2]
            );
        return false;
    }

    eatQuoteAdditional(quote) {
        const eatExtra = quote.length - 1;
        for (let i = 0; i < eatExtra; i++) {
            if (this.debug) console.log('eatQuoteAdditional', this.position, this.inspected[this.position]);
            this.position++;
        }
    }

    eatQuotedKey() {
        if (this.debug) console.log('eatQuotedKey', this.position, this.inspected[this.position]);
        this.setCheckpoint();
        this.throwIfJsonSpecialCharacter(this.inspected[this.position]);
        const quote = this.getQuote();
        this.quoted.push('"');
        this.position++;
        this.eatQuoteAdditional(quote);
        while (!this.checkQuote(quote)) {
            this.eatCharOrEscapedChar(quote);
        }
        if (this.debug) console.log('eatQuotedKey end', this.position, this.inspected[this.position]);
        this.quoted.push('"');
        this.position++;
        this.eatQuoteAdditional(quote);
    }

    eatUnquotedKey() {
        if (this.debug) console.log('eatUnquotedKey', this.position, this.inspected[this.position]);
        this.setCheckpoint();
        if (this.inspected[this.position] === '[') return this.eatNullKey();
        this.throwIfJsonSpecialCharacter(this.inspected[this.position]);
        this.quoted.push('"');
        while (this.inspected[this.position] !== ':' && this.inspected[this.position] !== ' ') {
            if (this.debug) console.log('eatUnquotedKey loop', this.position, this.inspected[this.position]);
            if (this.getQuote()) throw new Error('Unexpected quote in unquoted key');
            this.quoted.push(this.inspected[this.position]);
            this.position++;
        }
        this.quoted.push('"');
    }

    eatNullKey() {
        if (this.debug) console.log('eatNullKey', this.position, this.inspected[this.position]);
        if (this.inspected[this.position] !== '[') throw new Error('Expected open bracket');
        this.position++;
        if (this.inspected[this.position].toLowerCase() !== 'n') throw new Error('Expected n');
        this.position++;
        if (this.inspected[this.position].toLowerCase() !== 'u') throw new Error('Expected u');
        this.position++;
        if (this.inspected[this.position].toLowerCase() !== 'l') throw new Error('Expected l');
        this.position++;
        if (this.inspected[this.position].toLowerCase() !== 'l') throw new Error('Expected l');
        this.position++;
        if (this.inspected[this.position] !== ']') throw new Error('Expected close bracket');
        this.position++;
        this.quoted.push('"null"');
    }

    throwIfJsonSpecialCharacter(char) {
        if (char === '{' || char === '}' || char === '[' || char === ']' || char === ':' || char === ',') {
            throw new Error(`Unexpected character ${char} at position ${this.position}`);
        }
    }

    eatColon() {
        if (this.inspected[this.position] !== ':') throw new Error('Expected colon');
        this.quoted.push(this.inspected[this.position], ' ');
        this.position++;
    }

    eatValue() {
        if (this.debug) console.log('eatValue', this.position, this.inspected[this.position]);
        if (this.inspected[this.position] === '{') {
            this.eatObject();
        } else if (this.getQuote()) {
            this.eatString();
            this.eatConcatenatedStrings();
        } else if (this.inspected[this.position] === '[') {
            this.eatArray();
        } else {
            this.eatPrimitive();
        }
    }

    eatString() {
        this.setCheckpoint();
        if (this.debug) console.log('eatString', this.position, this.inspected[this.position]);
        let quote = this.getQuote();
        if (this.debug) console.log('eatString quote', quote);
        this.quoted.push('"');
        this.position++;
        this.eatQuoteAdditional(quote);
        while (!this.isEndQuoteMakingAllowanceForUnescapedSingleQuote(quote)) {
            this.eatCharOrEscapedChar(quote);
        }
        if (this.debug) console.log('end eatString', this.position, this.inspected[this.position]);
        this.quoted.push('"');
        this.position++;
        this.eatQuoteAdditional(quote);
    }

    eatConcatenatedStrings() {
        const virtualPosition = this.eatVirtualWhiteSpace(this.position + 1);
        if (this.inspected[virtualPosition] !== '+') return;

        if (this.debug) console.log('eatConcatenatedStrings', this.position, this.inspected[this.position]);

        this.position = virtualPosition + 1;
        this.eatWhitespace();
        this.quoted.pop();

        let quote = this.getQuote();
        if (this.debug) console.log('quote', quote);
        this.position++;
        this.eatQuoteAdditional(quote);
        while (!this.isEndQuoteMakingAllowanceForUnescapedSingleQuote(quote)) {
            this.eatCharOrEscapedChar(quote);
        }
        if (this.debug) console.log('end eatString', this.position, this.inspected[this.position]);
        this.quoted.push('"');
        this.position++;
        this.eatQuoteAdditional(quote);

        this.eatConcatenatedStrings();
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
        if (this.position + 2 >= this.inspected.length) return false;
        return (
            this.inspected[this.position] === '\\' &&
            this.inspected[this.position + 1] === '\\' &&
            this.inspected[this.position + 2] === '"'
        );
    }

    eatCharOrEscapedChar(quote) {
        if (this.position >= this.inspected.length) throw new Error('Unexpected end of quoted key or string');
        if (this.debug)
            console.log(
                'eatCharOrEscapedChar',
                this.position,
                this.inspected[this.position],
                ' ' + this.inspected[this.position].charCodeAt(0),
            );
        if (!this.checkQuote(quote) && this.inspected[this.position] === '\\') {
            if (this.debug) console.log('eatCharOrEscapedChar escape', this.position, this.inspected[this.position]);
            if (this.isDoubleEscapedDoubleQuote()) {
                if (this.debug) console.log('eatCharOrEscapedChar unescape double quote', this.position);
                this.position++;
            }
            if ((quote === "'" || quote === '`') && this.inspected[this.position + 1] === quote) {
                if (this.debug)
                    console.log(
                        'eatCharOrEscapedChar unescape single quote',
                        this.position,
                        this.inspected[this.position],
                    );
            } else this.quoted.push(this.inspected[this.position]);
            this.position++;
        }
        if ((quote === "'" || quote === '`') && this.inspected[this.position] === '"') this.quoted.push('\\');
        this.quoted.push(this.inspected[this.position]);
        this.position++;
    }

    eatArray() {
        if (this.debug) console.log('eatArray', this.position, this.inspected[this.position]);
        if (this.inspected[this.position] !== '[') throw new Error('Expected array');
        this.quoted.push(this.inspected[this.position]);
        this.position++;

        while (true) {
            this.eatWhitespace();
            if (this.inspected[this.position] === ']') {
                this.removeTrailingCommaIfPresent();
                break;
            }
            this.quotedLastCommaPosition = undefined;
            this.eatCircularOptional();
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
        if (
            this.inspected[this.position] === 'C' &&
            this.inspected[this.position + 1] === 'i' &&
            this.inspected[this.position + 2] === 'r' &&
            this.inspected[this.position + 3] === 'c' &&
            this.inspected[this.position + 4] === 'u' &&
            this.inspected[this.position + 5] === 'l' &&
            this.inspected[this.position + 6] === 'a' &&
            this.inspected[this.position + 7] === 'r'
        ) {
            this.eatCircular();
        }
    }

    eatCircular() {
        if (this.debug) console.log('eatCircular', this.position, this.inspected[this.position]);
        const testRegex = /[Circular *\d]/;
        while (testRegex.test(this.inspected[this.position])) {
            this.position++;
        }
        this.quoted.push('"Circular"');
    }

    eatComma() {
        if (this.debug) console.log('eatComma', this.position, this.inspected[this.position]);
        if (this.inspected[this.position] !== ',') throw new Error('Expected comma');
        this.quoted.push(this.inspected[this.position], ' ');
        this.quotedLastCommaPosition = this.quoted.length - 2;
        this.position++;
        return true;
    }

    eatCloseBracket() {
        if (this.debug) console.log('eatCloseBracket', this.position, this.inspected[this.position]);
        if (this.inspected[this.position] !== ']') throw new Error('Expected close bracket');
        this.quoted.push(this.inspected[this.position]);
        this.position++;
        return false;
    }

    eatPrimitive() {
        this.setCheckpoint();
        if (this.debug) console.log('eatPrimitive', this.position, this.inspected[this.position]);

        if (
            this.inspected[this.position].toLowerCase() === 'f' &&
            this.inspected[this.position + 1].toLowerCase() === 'a' &&
            this.inspected[this.position + 2].toLowerCase() === 'l' &&
            this.inspected[this.position + 3].toLowerCase() === 's' &&
            this.inspected[this.position + 4].toLowerCase() === 'e'
        )
            return this.eatFalse();

        if (
            this.inspected[this.position].toLowerCase() === 'n' &&
            this.inspected[this.position + 1].toLowerCase() === 'o' &&
            this.inspected[this.position + 2].toLowerCase() === 'n' &&
            this.inspected[this.position + 3].toLowerCase() === 'e'
        )
            return this.eatNone();

        if (
            this.inspected[this.position].toLowerCase() === 't' &&
            this.inspected[this.position + 1].toLowerCase() === 'r' &&
            this.inspected[this.position + 2].toLowerCase() === 'u' &&
            this.inspected[this.position + 3].toLowerCase() === 'e'
        )
            return this.eatTrue();

        const primitiveRegex = /([0-9a-zA-Z-.])/;
        while (primitiveRegex.test(this.inspected[this.position])) {
            this.quoted.push(this.inspected[this.position]);
            this.position++;
        }
    }

    eatFalse() {
        if (this.debug) console.log('eatFalse', this.position, this.inspected[this.position]);
        this.quoted.push('false');
        this.position += 5;
    }

    eatNone() {
        if (this.debug) console.log('eatNone', this.position, this.inspected[this.position]);
        this.quoted.push('null');
        this.position += 4;
    }

    eatTrue() {
        if (this.debug) console.log('eatTrue', this.position, this.inspected[this.position]);
        this.quoted.push('true');
        this.position += 4;
    }
}

module.exports = ParseJson;

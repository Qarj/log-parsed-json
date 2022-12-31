const parseJson = require('./parseJson.js');
const fs = require('fs');

beforeEach(() => {});

test('toString function exists', () => {
    expect(parseJson.toString).toBeDefined();
});

test('should return valid json string from inspected output', () => {
    const result = parseJson.toString("{ test: 'test', array: ['test', { test: 'test' }] }").replace(/\s/g, '');
    let expected = '{"test":"test","array":["test",{"test":"test"}]}';
    expect(result).toBe(expected);
    assertIsJson(result);
});

test('should return array of strings and json strings', () => {
    const result = parseJson.toArrayOfPlainStringsOrJson(
        "text before { test: 'test', array: ['test', { test: 'test' }] } text after",
    );
    expect(result[0]).toBe('text before ');
    expect(result[1]).toBe('{ "test": "test", "array": ["test", { "test": "test" }] }');
    expect(result[2]).toBe(' text after');
    assertIsJson(result[1]);
});

test('should cope with a brace in a string', () => {
    const result = parseJson.toArrayOfPlainStringsOrJson('real json {"value":["closing brace }"]}');
    expect(result[0]).toBe('real json ');
    expect(result[1]).toBe('{"value":["closing brace }"]}');
    assertIsJson(result[1]);
});

test('should cope with a double quote in string', () => {
    const result = parseJson.toArrayOfPlainStringsOrJson('real json {"value":["double quote \\"test\\""]}');
    expect(result[0]).toBe('real json ');
    expect(result[1]).toBe('{"value":["double quote \\"test\\""]}');
    assertIsJson(result[1]);
});

test('should parse an array of numbers', () => {
    const result = parseJson.toArrayOfPlainStringsOrJson('real json { "test": [ 1, 2, 3] }');
    expect(result[0]).toBe('real json ');
    expect(result[1]).toBe('{ "test": [ 1, 2, 3] }');
    assertIsJson(result[1]);
});

test('should cope with {}', () => {
    const result = parseJson.toArrayOfPlainStringsOrJson('not json {} abc');
    expect(result[0]).toBe('not json ');
    expect(result[1]).toBe('{');
    expect(result[2]).toBe('} abc');
});

test('should throw on {"}', () => {
    expect(() => {
        parseJson.toString('{"}');
    }).toThrow('Unexpected end of quoted key or string');
});

test('should cope with all kinds of whitespace', () => {
    const jsonWithQuotedWhiteSpace = ' {  \t "test"\t: \t 123 \r \n }';
    const result = parseJson.toString(jsonWithQuotedWhiteSpace);
    expect(result).toBe(jsonWithQuotedWhiteSpace);
});

test('when changing a single quoted string to double quotes, needs to quote the double quotes', () => {
    const scenario = `{ '"abc ': 'test' }`;
    const result = parseJson.toString(scenario);
    expect(result).toBe(`{ "\\\"abc ": "test" }`);
});

test('when changing a single quoted string to double quotes, needs to unquote the single quotes', () => {
    const scenario = fs.readFileSync('./singlequoted.txt', 'utf8'); // defeat prettier
    const result = parseJson.toString(scenario);
    expect(result).toBe(`{ "abc '": "test'", "key": 123 }`);
});

function assertIsJson(json) {
    let isValidJson = false;
    try {
        JSON.parse(json);
        isValidJson = true;
    } catch (e) {}
    expect(isValidJson).toBe(true);
}

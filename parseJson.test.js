const parseJson = require('./parseJson.js');

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

function assertIsJson(json) {
    let isValidJson = false;
    try {
        JSON.parse(json);
        isValidJson = true;
    } catch (e) {}
    expect(isValidJson).toBe(true);
}

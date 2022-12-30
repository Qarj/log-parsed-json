const parseJson = require('./parseJson.js');

beforeEach(() => {});

test('toString function exists', () => {
    expect(parseJson.toString).toBeDefined();
});

test('should return valid json string from inspected output', () => {
    const result = parseJson.toString("{ test: 'test', array: ['test', { test: 'test' }] }").replace(/\s/g, '');
    let expected = '{"test":"test","array":["test",{"test":"test"}]}';
    expect(result).toBe(expected);
    let isValidJson = false;
    try {
        JSON.parse(result);
        isValidJson = true;
    } catch (e) {}
    expect(isValidJson).toBe(true);
});

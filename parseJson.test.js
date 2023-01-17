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
    const result = parseJson.toArrayOfPlainStringsOrJson('is json {} abc');
    expect(result[0]).toBe('is json ');
    expect(result[1]).toBe('{}');
    expect(result[2]).toBe(' abc');
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
    assertIsJson(result);
});

test('when changing a single quoted string to double quotes, needs to quote the double quotes', () => {
    const scenario = `{ '"abc ': 'test' }`;
    const result = parseJson.toString(scenario);
    expect(result).toBe(`{ "\\\"abc ": "test" }`);
    assertIsJson(result);
});

test('when changing a single quoted string to double quotes, needs to unquote the single quotes', () => {
    const scenario = fs.readFileSync('./singlequoted.txt', 'utf8'); // defeat prettier
    const result = parseJson.toString(scenario);
    expect(result).toBe(`{ "abc '": "test'", "key": 123 }`);
    assertIsJson(result);
});

test('when changing a backtick quoted string to double quotes, needs to fix quotes', () => {
    const scenario = "{ `abc '\"`: `test'\"`, 'key': 123}";
    const result = parseJson.toString(scenario);
    expect(result).toBe(`{ \"abc '\\\"\": \"test'\\\"\", \"key\": 123}`);
    assertIsJson(result);
});

test('when changing a backticked quoted string to double quotes, needs to unquote the single quotes but not double', () => {
    const scenario = fs.readFileSync('./backticked.txt', 'utf8'); // defeat prettier
    const result = parseJson.toString(scenario);
    expect(result).toBe('{ "abc \'\\"`": "test`\'\\"", "key": 123 }');
    assertIsJson(result);
});

test('cope with trailing comma in key value pairs for object', () => {
    const scenario = '{ "abc": 123, }';
    const result = parseJson.toString(scenario);
    expect(result).toBe('{ "abc": 123 }');
    assertIsJson(result);
});

test('cope with circular references', () => {
    const scenario = `{
  abc: <ref *1> {
    abc: 123,
    def: 'test',
    ghi: { jkl: 'test' },
    xyz: { zzz: 123, jj: 'test', abc: [Circular *1] }
  },
  def: <ref *2> {
    zzz: 123,
    jj: 'test',
    abc: <ref *1> {
      abc: 123,
      def: 'test',
      ghi: { jkl: 'test' },
      xyz: [Circular *2]
    }
  }
}`;

    const result = parseJson.toString(scenario);
    expect(result).toMatch('"Circular"');
    assertIsJson(result);
});

test('can cope with stringified strings', () => {
    const scenario = `{\n  \"abc\": 123,\n  \"object\": {\n    \"abc\": 123,\n    \"def\": \"test\",\n    \"mystringy\": \"{\\n  \\\"2\\\": true,\\n  \\\"abc\\\": 123,\\n  \\\"def\\\": \\\"test\\\",\\n  \\\"ghi\\\": {\\n    \\\"jkl\\\": \\\"test\\\",\\n    \\\"null\\\": null,\\n    \\\"\\\": true,\\n    \\\"result\\\": \\\"{\\\\\\\"abc\\\\\\\":123,\\\\\\\"def\\\\\\\":\\\\\\\"test\\\\\\\",\\\\\\\"ghi\\\\\\\":{\\\\\\\"jkl\\\\\\\":\\\\\\\"test\\\\\\\"}}\\\"\\n  }\\n}\"\n  }\n}`;
    const result = parseJson.toString(scenario);
    assertIsJson(result);
});

test('{} is valid json', () => {
    const scenario = '{}';
    const result = parseJson.toString(scenario);
    assertIsJson(result);
});

test('should play nice with empty objects', () => {
    const scenario = '{ "t": [], "a": {} }';
    const result = parseJson.toString(scenario);
    assertIsJson(result);
});

test('should cope with overly stringified objects', () => {
    const object = {
        'arr"ay': [
            1,
            {
                'obj"ec\'}t': { '\n\nk"\'ey': "\"\"''',value" },
            },
            [],
            {},
            true,
            null,
        ],
    };
    const scenario = JSON.stringify(JSON.stringify(JSON.stringify(JSON.stringify(object))));
    const result = parseJson.toString(scenario);
    assertIsJson(result);
});

test('should change None primitive to null', () => {
    const object = '{ "abc": None }';
    const result = parseJson.toString(object);
    expect(result).toBe('{ "abc": null }');
    assertIsJson(result);
});

function assertIsJson(json) {
    let isValidJson = false;
    try {
        JSON.parse(json);
        isValidJson = true;
    } catch (e) {}
    expect(isValidJson).toBe(true);
}

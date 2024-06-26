/* eslint-disable no-useless-escape */
/* eslint-disable no-empty */
const parseJson = require('./index.js');
const fs = require('fs');

beforeEach(() => {});

test('repairJson function exists', () => {
    expect(parseJson.repairJson).toBeDefined();
});

test('should parse a number', () => {
    const result = parseJson.repairJson('{ "number": 123 }');
    expect(result).toBe('{ "number": 123 }');
});

test('should parse scientific notation with plus', () => {
    const result = parseJson.repairJson('{ "number": 1.23e+20 }');
    expect(result).toBe('{ "number": 1.23e+20 }');
});

test('should parse scientific notation with minus', () => {
    const result = parseJson.repairJson('{ "number": -1.23e-20 }');
    expect(result).toBe('{ "number": -1.23e-20 }');
});

test('should parse scientific notation without plus', () => {
    const result = parseJson.repairJson('{ "number": 1.2e9 }');
    expect(result).toBe('{ "number": 1.2e9 }');
});

test('should parse scientific notation with capital E', () => {
    const result = parseJson.repairJson('{ "number": 1.2E9 }');
    expect(result).toBe('{ "number": 1.2e9 }');
});

test('should throw on invalid number', () => {
    const scenario = '{ "number": 1. }';
    expect(() => {
        parseJson.repairJson(scenario);
    }).toThrow('Number cannot have trailing decimal point');
});

test('should throw when number has a leading plus', () => {
    const scenario = '{ "number": +1 }';
    expect(() => {
        parseJson.repairJson(scenario);
    }).toThrow('Primitive not recognized, must start with f, t, n, or be numeric');
});

test('should throw on invalid scientific notation - case 1', () => {
    const scenario = '{ "number": 1.e9 }';
    expect(() => {
        parseJson.repairJson(scenario);
    }).toThrow('Number cannot have decimal point followed by exponent');
});

test('should throw on invalid scientific notation - case 2', () => {
    const scenario = '{ "number": 1.2e+ }';
    expect(() => {
        parseJson.repairJson(scenario);
    }).toThrow('Number cannot have trailing sign');
});

test('should throw on invalid scientific notation - case 3', () => {
    const scenario = '{ "number": 1.2e }';
    expect(() => {
        parseJson.repairJson(scenario);
    }).toThrow('Number cannot have trailing exponent');
});

test('should throw error when given an unquoted string value', () => {
    let object = `{ test: postgres }`;
    expect(() => {
        parseJson.repairJson(object);
    }).toThrow('Primitive not recognized, must start with f, t, n, or be numeric');
});

test('should throw with unquoted string value in array', () => {
    let object = `{ test: [1, 2, postgres] }`;
    expect(() => {
        parseJson.repairJson(object);
    }).toThrow('Primitive not recognized, must start with f, t, n, or be numeric');
});

test('should throw error when a number starts with zero', () => {
    let object = `{ test: 0123 }`;
    expect(() => {
        parseJson.repairJson(object);
    }).toThrow('Number cannot have redundant leading 0');
});

test('should cope with negative numbers', () => {
    let object = `{ test: -123 }`;
    let result;
    expect(() => {
        result = parseJson.repairJson(object);
    }).not.toThrow();
    expect(result).toBe('{ "test": -123 }');
});

test('should cope with a negative decimal', () => {
    let object = `{ test: -0.123 }`;
    let result;
    expect(() => {
        result = parseJson.repairJson(object);
    }).not.toThrow();
    expect(result).toBe('{ "test": -0.123 }');
});

test('should cope with a decimal starting with zero', () => {
    let object = `{ test: 0.123 }`;
    let result;
    expect(() => {
        result = parseJson.repairJson(object);
    }).not.toThrow();
    expect(result).toBe('{ "test": 0.123 }');
});

test('should throw error with a fake primative starting with f', () => {
    let object = `{ test: fake }`;
    expect(() => {
        parseJson.repairJson(object);
    }).toThrow('Keyword not recognized, must be true, false, null or none');
});

test('should throw correct error with incorrect primitive f', () => {
    let object = `{test:f}`;
    expect(() => {
        parseJson.repairJson(object);
    }).toThrow('Keyword not recognized, must be true, false, null or none');
});

test('should throw correct error when a number contains a letter', () => {
    let object = `{ test: 123a }`;
    expect(() => {
        parseJson.repairJson(object);
    }).toThrow('Expected colon');
});

test('should parse a decimal', () => {
    const result = parseJson.repairJson('{ "decimal": 123.456 }');
    expect(result).toBe('{ "decimal": 123.456 }');
});

test('should parse true', () => {
    const result = parseJson.repairJson('{ "boolean": true }');
    expect(result).toBe('{ "boolean": true }');
});

test('should parse false', () => {
    const result = parseJson.repairJson('{ "boolean": false }');
    expect(result).toBe('{ "boolean": false }');
});

test('should parse null', () => {
    const result = parseJson.repairJson('{ "null": null }');
    expect(result).toBe('{ "null": null }');
});

test('should return valid json string from inspected output', () => {
    const result = parseJson.repairJson("{ test: 'test', array: ['test', { test: 'test' }] }").replace(/\s/g, '');
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

test('should return first valid json object', () => {
    const result = parseJson.firstJson(
        "text before { test: 'test', array: ['test', { test: 'test' }] } text { hey: 1 } after",
    );
    expect(result).toBe('{ "test": "test", "array": ["test", { "test": "test" }] }');
    assertIsJson(result);
});

test('should return last valid json object', () => {
    const result = parseJson.lastJson(
        "text before { test: 'test', array: ['test', { test: 'test' }] } text { hey: 1 } after",
    );
    expect(result).toBe('{ "hey": 1 }');
    assertIsJson(result);
});

test('should return largest valid json object', () => {
    const result = parseJson.largestJson(
        "text { gday: 'hi' } before { test: 'test', array: ['test', { test: 'test' }] } text { hey: 1 } after",
    );
    expect(result).toBe('{ "test": "test", "array": ["test", { "test": "test" }] }');
    assertIsJson(result);
});

test('should return json object matching regular expression', () => {
    const result = parseJson.jsonMatching(
        "text { gday: 'hi' } before { test: 'test', array: ['test', { test: 'test' }] } text { hey: 1 } after",
        /hey/,
    );
    expect(result).toBe('{ "hey": 1 }');
    assertIsJson(result);
});

test('should cope with a brace in a string', () => {
    const result = parseJson.toArrayOfPlainStringsOrJson('real json {"value":["closing brace }"]}');
    expect(result[0]).toBe('real json ');
    expect(result[1]).toBe('{ "value": ["closing brace }"] }');
    assertIsJson(result[1]);
});

test('should cope with a double quote in string', () => {
    const result = parseJson.toArrayOfPlainStringsOrJson('real json {"value":["double quote \\"test\\""]}');
    expect(result[0]).toBe('real json ');
    expect(result[1]).toBe('{ "value": ["double quote \\"test\\""] }');
    assertIsJson(result[1]);
});

test('should parse an array of numbers', () => {
    const result = parseJson.toArrayOfPlainStringsOrJson('real json { "test": [ 1, 2, 3] }');
    expect(result[0]).toBe('real json ');
    expect(result[1]).toBe('{ "test": [1, 2, 3] }');
    assertIsJson(result[1]);
});

test('should cope with {}', () => {
    const result = parseJson.toArrayOfPlainStringsOrJson('is json {} abc');
    expect(result[0]).toBe('is json ');
    expect(result[1]).toBe('{  }');
    expect(result[2]).toBe(' abc');
});

test('should throw on {"}', () => {
    expect(() => {
        parseJson.repairJson('{"}');
    }).toThrow('Unexpected end of quoted key or string');
});

test('should cope with all kinds of whitespace', () => {
    const jsonWithQuotedWhiteSpace = ' {  \t "test"\t: \t 123 \r \n }';
    const result = parseJson.repairJson(jsonWithQuotedWhiteSpace);
    expect(result).toBe('{ "test": 123 }');
    assertIsJson(result);
});

test('when changing a single quoted string to double quotes, needs to quote the double quotes', () => {
    const scenario = `{ '"abc ': 'test' }`;
    const result = parseJson.repairJson(scenario);
    expect(result).toBe(`{ "\\\"abc ": "test" }`);
    assertIsJson(result);
});

test('when changing a single quoted string to double quotes, needs to unquote the single quotes', () => {
    const scenario = fs.readFileSync('./test/singlequoted.txt', 'utf8'); // defeat prettier
    const result = parseJson.repairJson(scenario);
    expect(result).toBe(`{ "abc '": "test'", "key": 123 }`);
    assertIsJson(result);
});

test('when changing a backtick quoted string to double quotes, needs to fix quotes', () => {
    const scenario = "{ `abc '\"`: `test'\"`, 'key': 123}";
    const result = parseJson.repairJson(scenario);
    expect(result).toBe(`{ \"abc '\\\"\": \"test'\\\"\", \"key\": 123 }`);
    assertIsJson(result);
});

test('when changing a backticked quoted string to double quotes, needs to unquote the single quotes but not double', () => {
    const scenario = fs.readFileSync('./test/backticked.txt', 'utf8'); // defeat prettier
    const result = parseJson.repairJson(scenario);
    expect(result).toBe('{ "abc \'\\"`": "test`\'\\"", "key": 123 }');
    assertIsJson(result);
});

test('cope with trailing comma in key value pairs for object', () => {
    const scenario = '{ "abc": 123, }';
    const result = parseJson.repairJson(scenario);
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

    const result = parseJson.repairJson(scenario);
    expect(result).toMatch('"Circular"');
    expect(result).toBe(
        '{ "abc": { "abc": 123, "def": "test", "ghi": { "jkl": "test" }, "xyz": { "zzz": 123, "jj": "test", "abc": ["Circular"] } }, "def": { "zzz": 123, "jj": "test", "abc": { "abc": 123, "def": "test", "ghi": { "jkl": "test" }, "xyz": ["Circular"] } } }',
    );
    assertIsJson(result);
});

test('can cope with stringified strings', () => {
    const scenario = `{\n  \"abc\": 123,\n  \"object\": {\n    \"abc\": 123,\n    \"def\": \"test\",\n    \"mystringy\": \"{\\n  \\\"2\\\": true,\\n  \\\"abc\\\": 123,\\n  \\\"def\\\": \\\"test\\\",\\n  \\\"ghi\\\": {\\n    \\\"jkl\\\": \\\"test\\\",\\n    \\\"null\\\": null,\\n    \\\"\\\": true,\\n    \\\"result\\\": \\\"{\\\\\\\"abc\\\\\\\":123,\\\\\\\"def\\\\\\\":\\\\\\\"test\\\\\\\",\\\\\\\"ghi\\\\\\\":{\\\\\\\"jkl\\\\\\\":\\\\\\\"test\\\\\\\"}}\\\"\\n  }\\n}\"\n  }\n}`;
    const result = parseJson.repairJson(scenario);
    assertIsJson(result);
});

test('{} is valid json', () => {
    const scenario = '{}';
    const result = parseJson.repairJson(scenario);
    assertIsJson(result);
});

test('should play nice with empty objects', () => {
    const scenario = '{ "t": [], "a": {} }';
    const result = parseJson.repairJson(scenario);
    expect(result).toBe('{ "t": [], "a": {  } }');
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
    const result = parseJson.repairJson(scenario);
    expect(result).toBe(
        `{ "arr\\"ay": [1, { "obj\\"ec'}t": { "\\n\\nk\\"'ey": "\\"\\"''',value" } }, [], {  }, true, null] }`,
    );
    assertIsJson(result);
});

test('should concatenate strings with +', () => {
    const object = '{ "abc": "test" + "test2" }';
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "abc": "testtest2" }');
    assertIsJson(result);
});

test('should concatenate strings with + and preserve whitespace', () => {
    const object = '{ "abc": "test" + "test2" + "test3" }';
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "abc": "testtest2test3" }');
    assertIsJson(result);
});

test('should concatenate strings with different quotes', () => {
    const object = `{ "abc": 'test' + \`test2\` + "test3" + \\"test4\\" }`;
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "abc": "testtest2test3test4" }');
    assertIsJson(result);
});

test('should cope with Python true', () => {
    const object = '{ "abc": True }';
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "abc": true }');
    assertIsJson(result);
});

test('should cope with Python false', () => {
    const object = '{ "abc": False }';
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "abc": false }');
    assertIsJson(result);
});

test('should change None primitive to null', () => {
    const object = '{ "abc": None }';
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "abc": null }');
    assertIsJson(result);
});

test('should change noNe primitive to null', () => {
    const object =
        "{'intent': {'slots': {'location': noNe}, 'confirmationState': 'None', 'name': 'JobSearch', 'state': 'InProgress'}, 'nluConfidence': 0.8}";
    const result = parseJson.repairJson(object);
    expect(result).toBe(
        '{ "intent": { "slots": { "location": null }, "confirmationState": "None", "name": "JobSearch", "state": "InProgress" }, "nluConfidence": 0.8 }',
    );
    assertIsJson(result);
});

test('should treat space in key name as terminator if no in quotes', () => {
    const object = ` { onlyKey } `;
    expect(() => {
        parseJson.repairJson(object);
    }).toThrow('Expected colon');
});

test('should support [null] key name', () => {
    const object = ` { [null]: 'test' } `;
    const result = parseJson.repairJson(object);
    assertIsJson(result);
});

test('bug - should support newline after object before array end', () => {
    let object = `{
    savedJobs: [
        {
            external: false
        }
    ]
}`;
    const result = parseJson.repairJson(object);
    assertIsJson(result);
});

test('should support trailing comma in array - 1', () => {
    let object = `{
    savedJobs: [
        {
            external: false
        },
    ]
}`;
    const result = parseJson.repairJson(object);
    assertIsJson(result);
});

test('should support trailing comma in array - 2', () => {
    let object = '{ arr: [1,2,3,]}';
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "arr": [1, 2, 3] }');
    assertIsJson(result);
});

test('should cope with escaped double quotes used as quotes - aka Kibana', () => {
    let object = `{\\"@metadata\\":{\\"beat\\":\\"filebeat\\"}}`;
    const result = parseJson.repairJson(object);
    assertIsJson(result);
});

test('should cope with escaped double quotes used as quotes - inside strings', () => {
    let object = `{\\"@metadata\\":{\\"message\\":\\"{\\\\"url\\\\": \\\\"hey\\\\"\\"}}`;
    const result = parseJson.repairJson(object);
    assertIsJson(result);
});

test('should cope with double escaped double quotes used as quotes - case 1', () => {
    let object = `{ \\\\"test\\\\": \\\\"test1\\\\" }`;
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "test": "test1" }');
    assertIsJson(result);
});

test('should cope with double escaped double quotes used as quotes - case 2', () => {
    let object = `{\\"@metadata\\":{\\"message\\":\\"{\\\\"url\\\\": \\\\"hey\\\\"}\\"}}`;
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "@metadata": { "message": "{\\"url\\": \\"hey\\"}" } }');
    assertIsJson(result);
});

test('should cope with pretty formatted sloping double quotes as output by Word', () => {
    let object = `{
    "abc": “test”
}`;
    const result = parseJson.repairJson(object);
    assertIsJson(result);
});

test('should cope with pretty formatted sloping double quotes as output by Word - case 2', () => {
    let object = `{ “name”: “Alice”, “age”: 26, }`;

    const result = parseJson.repairJson(object);
    assertIsJson(result);
});

test('should cope with a pair of left curly quotes in extreme mode', () => {
    let object = `{ “name“: “Alice“, “age“: 26, }`;

    const result = parseJson.repairJson(object, { attemptRepairOfMismatchedQuotes: true });
    assertIsJson(result);
});

test('should cope with a pair of right curly quotes in extreme mode', () => {
    let object = `{ ”name”: ”Alice”, ”age”: 26, }`;

    const result = parseJson.repairJson(object, { attemptRepairOfMismatchedQuotes: true });
    assertIsJson(result);
});

test('should cope with mismatched quotes in extreme mode - case 1', () => {
    let object = `{ "name”: ”Alice", ”age': 26, }`;

    const result = parseJson.repairJson(object, { attemptRepairOfMismatchedQuotes: true });
    assertIsJson(result);
});

test('should cope with mismatched quotes in extreme mode - case 2', () => {
    let object = `{ "name\`: ”Alice", 'age": 26, }`;

    const result = parseJson.repairJson(object, { attemptRepairOfMismatchedQuotes: true });
    assertIsJson(result);
});

test('should cope with missing value quotes in extreme mode', () => {
    let object = `{ "name": Alice }`;

    const result = parseJson.repairJson(object, { attemptRepairOfMissingValueQuotes: true });
    assertIsJson(result);
    expect(result).toBe(`{ "name": "Alice " }`);
});

test('should still be able to eat primitives in extreme mode', () => {
    let object = `{ "name": Alice, age: 26, isAlive: true }`;

    const result = parseJson.repairJson(object, { attemptRepairOfMissingValueQuotes: true });
    assertIsJson(result);
    expect(result).toBe(`{ "name": "Alice", "age": 26, "isAlive": true }`);
});

test('should cope with stack overflow json', () => {
    let object = `{
staus: "Success",
id: 1,
data: [{'Movie':'kung fu panda','% viewed': 50.5},{'Movie':'kung fu panda 2','% viewed':1.5}],
metadata: {'filters':['Movie', 'Percentage Viewed' ] , 'params':{'content':'Comedy', 'type': 'Movie'}}
}`;
    const result = parseJson.repairJson(object);
    assertIsJson(result);
});

test('should insert missing commas between key value pairs', () => {
    let object = `{
    "abc": "def"
    "ghi": "jkl"
}`;
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "abc": "def", "ghi": "jkl" }');
    assertIsJson(result);
});

test('should insert missing commas between key value pairs - case 2', () => {
    let object = `{
    "abc": "def"
    "ghi": "jkl"
    "mno": "pqr"
}`;
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "abc": "def", "ghi": "jkl", "mno": "pqr" }');
    assertIsJson(result);
});

test('should insert missing commas between array elements', () => {
    let object = `{
    "abc": [
        "def"
        "ghi" 3 true null
    ]
}`;
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "abc": ["def", "ghi", 3, true, null] }');
    assertIsJson(result);
});

test('should error the right way given broken json', () => {
    let object = `{ "test": "bad  { "test": "good" }`;
    expect(() => {
        parseJson.repairJson(object);
    }).toThrow('Unexpected quote in unquoted key');
});

test('should cope with a difficult scenario', () => {
    let object = `{ 
value: true peter: 'fun' number: 3 somekey: "a string"
array: [ 2 9234 98234 9 9213840  98213409 98234]
}`;
    const result = parseJson.repairJson(object);
    assertIsJson(result);
});

test('should cope with unquoted single quote inside single quoted string if an s follows', () => {
    let object = `{ 'test': 'test's' }`;
    const result = parseJson.repairJson(object);
    assertIsJson(result);
    expect(result).toBe(`{ "test": "test's" }`);
});

test('should run quickly and not have catatrophic garbage collection', () => {
    const protoObject = {
        array: ['test', 1234, true, null, undefined, { abc: 'test' }],
        string: 'test',
        number: 1234,
        boolean: true,
    };

    const object = {};
    for (let i = 0; i < 4; i++) {
        object[i] = protoObject;
    }

    let string = JSON.stringify(object);
    for (let i = 0; i < 4; i++) {
        string += `Some text ${string} more text then ${string} end\n`;
    }

    const startTime = Date.now();
    const result = parseJson.toArrayOfPlainStringsOrJson(string);
    for (let i = 0; i < result.length; i++) {
        parseJson.canParseJson(result[i]);
    }

    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(5000);
});

test('should repair extra commas in both array and after value', () => {
    let object = `{"artist":["keith",8,2,],}`;
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "artist": ["keith", 8, 2] }');
    assertIsJson(result);
});

test('should add missing commas in various examples', () => {
    let object = `{"artist":[5 22 32.1 44 {"two":7 eight:9}],}`;
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "artist": [5, 22, 32.1, 44, { "two": 7, "eight": 9 }] }');
    assertIsJson(result);
});

test('should remove extra starting double quote added by gpt-3.5-turbo', () => {
    let object = `{"story": {""5": "10-10"}}`;
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "story": { "5": "10-10" } }');
    assertIsJson(result);
});

test('should not remove quoted double quote', () => {
    let object = `{"story": {"\\"5": "10-10"}}`;
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "story": { "\\"5": "10-10" } }');
    assertIsJson(result);
});

test('should not remove quoted double quote followed by space colon', () => {
    let object = `{"story": {"\\": 5": "10-10"}}`;
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "story": { "\\": 5": "10-10" } }');
    assertIsJson(result);
});

test('should not get confused by space colon', () => {
    let object = `{"story": {": 5": "10-10"}}`;
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "story": { ": 5": "10-10" } }');
    assertIsJson(result);
});

test('should not get confused by colon', () => {
    let object = `{"story": {":5": "10-10"}}`;
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "story": { ":5": "10-10" } }');
    assertIsJson(result);
});

test('single quotes at start of double quotes key followed by space colon', () => {
    let object = `{"story": {"':5": "10-10"}}`;
    const result = parseJson.repairJson(object);
    expect(result).toBe(`{ "story": { "':5": "10-10" } }`);
    assertIsJson(result);
});

test('backtick at start of double quotes key followed by space colon', () => {
    let object = '{"story": {"`:5": "10-10"}}';
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "story": { "`:5": "10-10" } }');
    assertIsJson(result);
});

test('single quotes at start of double quotes key not followed by space colon', () => {
    let object = `{"story": {"'-:5": "10-10"}}`;
    const result = parseJson.repairJson(object);
    expect(result).toBe(`{ "story": { "'-:5": "10-10" } }`);
    assertIsJson(result);
});

test('backtick at start of double quotes key not followed by space colon', () => {
    let object = '{"story": {"`-:5": "10-10"}}';
    const result = parseJson.repairJson(object);
    expect(result).toBe('{ "story": { "`-:5": "10-10" } }');
    assertIsJson(result);
});

test('should repair JSON with unescaped newline in string value - backtick outer', () => {
    let object = `{"res": "Sorry.
Bye."}`;
    const result = parseJson.repairJson(object);
    expect(result).toBe(`{ "res": "Sorry.\\nBye." }`);
    assertIsJson(result);
});

test('should repair JSON with unescaped newline in string value - single quote outer', () => {
    let object = '{"res": "Sorry.\nBye."}';
    const result = parseJson.repairJson(object);
    expect(result).toBe(`{ "res": "Sorry.\\nBye." }`);
    assertIsJson(result);
});

test('should repair JSON with unescaped newline in string value - single quote inner', () => {
    let object = `{'res': 'Sorry.\nBye.'}`;
    const result = parseJson.repairJson(object);
    expect(result).toBe(`{ "res": "Sorry.\\nBye." }`);
    assertIsJson(result);
});

test('should repair JSON with unescaped newline in string value - backtick inner', () => {
    let object = '{`res`: `Sorry.\nBye.`}';
    const result = parseJson.repairJson(object);
    expect(result).toBe(`{ "res": "Sorry.\\nBye." }`);
    assertIsJson(result);
});

test('should repair basdly mis-escaped JSON', () => {
    let object = '{\\"res\\": \\"{ \\\\\\"a\\\\\\": \\\\\\"b\\\\\\" }\\"}';
    const result = parseJson.repairJson(object);
    expect(result).toBe(`{ "res": "{ \\"a\\": \\"b\\" }" }`);
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

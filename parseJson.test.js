const parseJson = require('./index.js');
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

test('should change noNe primitive to null', () => {
    const object =
        "{'intent': {'slots': {'location': noNe}, 'confirmationState': 'None', 'name': 'JobSearch', 'state': 'InProgress'}, 'nluConfidence': 0.8}";
    const result = parseJson.toString(object);
    expect(result).toBe(
        '{"intent": {"slots": {"location": null}, "confirmationState": "None", "name": "JobSearch", "state": "InProgress"}, "nluConfidence": 0.8}',
    );
    assertIsJson(result);
});

test('should treat space in key name as terminator if no in quotes', () => {
    const object = ` { toString } `;
    expect(() => {
        parseJson.toString(object);
    }).toThrow('Expected colon');
});

test('should support [null] key name', () => {
    const object = ` { [null]: 'test' } `;
    const result = parseJson.toString(object);
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
    const result = parseJson.toString(object);
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
    const result = parseJson.toString(object);
    assertIsJson(result);
});

test('should support trailing comma in array - 2', () => {
    let object = '{ arr: [1,2,3,]}';
    const result = parseJson.toString(object);
    assertIsJson(result);
});

test('should support trailing comma in array - 3', () => {
    let object = '{ arr: [,]}';
    const result = parseJson.toString(object);
    assertIsJson(result);
});

test('should escape single quotes in strings if not followed by comma or close brace - case 1', () => {
    let object = "{ 'abc': 'test's' }";
    const result = parseJson.toString(object);
    assertIsJson(result);
    expect(result).toBe('{ "abc": "test\'s" }');
});

test('should escape single quotes in strings if not followed by comma or close brace - case 2', () => {
    let object = "{ 'abc': 'test'' }";
    const result = parseJson.toString(object);
    assertIsJson(result);
    expect(result).toBe('{ "abc": "test\'" }');
});

test('should escape single quotes in strings if not followed by comma or close brace - case 3', () => {
    let object = "{ 'abc': 'test' ' }";
    const result = parseJson.toString(object);
    assertIsJson(result);
    expect(result).toBe('{ "abc": "test\' " }');
});

test('should cope with escaped double quotes used as quotes - aka Kibana', () => {
    let object = `{\"@metadata\":{\"beat\":\"filebeat\",\"type\":\"_doc\",\"version\":\"8.4.3\"},\"@timestamp\":\"2023-06-08T08:52:41.458Z\",\"agent\":{\"ephemeral_id\":\"b2fdf6f4\",\"id\":\"bc3c3c88\",\"name\":\"ip-10.eu-west-1.compute.internal\",\"type\":\"filebeat\",\"version\":\"8.1.0\"},\"cloud\":{\"account\":{\"id\":\"1234\"},\"availability_zone\":\"eu-west-22b\",\"image\":{\"id\":\"ami-42\"},\"instance\":{\"id\":\"i-1234\"},\"machine\":{\"type\":\"m5.xlarge\"},\"provider\":\"aws\",\"region\":\"eu-west-8\",\"service\":{\"name\":\"EC2\"}},\"container\":{\"id\":\"93157a2\",\"image\":{\"name\":\"1234.dkr.ecr.eu-west-1.amazonaws.com/lrp:12-feat\"},\"labels\":{\"com_amazonaws_ecs_cluster\":\"platform-dev\",\"com_amazonaws_ecs_container-name\":\"st\",\"com_amazonaws_ecs_task-arn\":\"arn:aws:ecs:eu-west-1:1234:task/platform-dev/3b\",\"com_amazonaws_ecs_task-definition-family\":\"st\",\"com_amazonaws_ecs_task-definition-version\":\"5\",\"description\":\"js\",\"gather_logs\":\"json\",\"maintainer\":\"OPS\",\"system\":\"C64\",\"type\":\"common\"},\"name\":\"ecs-example\"},\"docker\":{\"container\":{\"labels\":{\"com_amazonaws_ecs_cluster\":\"platform-dev\",\"com_amazonaws_ecs_container-name\":\"lrp\",\"com_amazonaws_ecs_task-arn\":\"arn:aws:ecs:eu-west-1:1234:task/platform-dev/3b5b\",\"com_amazonaws_ecs_task-definition-family\":\"lrp\",\"com_amazonaws_ecs_task-definition-version\":\"5\",\"description\":\"node\",\"gather_logs\":\"json\",\"maintainer\":\"OPS\",\"system\":\"VZ-200\",\"type\":\"common\"}}},\"ecs\":{\"version\":\"8.3.0\"},\"event\":\"404\",\"fields\":{\"cluster\":\"platform-dev\",\"env\":\"dev\",\"kafka_topic\":\"services_dev\",\"log_type\":\"service_json\",\"platform\":\"ecs\"},\"host\":{\"architecture\":\"x86_64\",\"containerized\":false,\"hostname\":\"ip-10.eu-west-1.compute.internal\",\"ip\":[\"10\",\"fe80\",\"172\",\"fe80\",\"fe80\",\"fe80\",\"fe80\",\"fe80\",\"fe80\"],\"mac\":[\"02\",\"06\",\"8e\",\"9a\",\"aa\",\"c2\",\"d6\"],\"name\":\"ip.eu-west-1.compute.internal\",\"os\":{\"codename\":\"focal\",\"family\":\"debian\",\"kernel\":\"4.amzn2.x86_64\",\"name\":\"VIC-20\",\"platform\":\"IIe\",\"type\":\"linux\",\"version\":\"21.04.5\"}},\"input\":{\"type\":\"container\"},\"input_type\":\"log\",\"kafka\":{\"consumer_group\":\"logstash_dev_services\",\"headers\":{},\"key\":null,\"offset\":813,\"partition\":35,\"topic\":\"services_dev\"},\"level\":\"ERROR\",\"log\":{\"file\":{\"path\":\"/var/lib/docker/containers/931-json.log\"},\"offset\":14},\"logger\":\"default\",\"message\":\"{\\"url\\":\\"/actuator/info\\",\\"event\\":\\"404\\"}\",\"request\":{\"name\":\"lrp\"},\"service\":{\"environment\":\"dev\",\"method\":\"GET\",\"name\":\"lrp\",\"url\":\"/actuator/info\"},\"source\":\"/opt/service.json\",\"source_type\":\"kafka\",\"stream\":\"stdout\",\"tags\":[\"dev\"],\"timestamp\":\"2023-06-08T08:52:41.458Z\",\"type\":\"service_json\",\"url\":\"/actuator/info\"}`;
    const result = parseJson.toString(object);
    assertIsJson(result);
});

test('should run quickly and not have catatrophic garbage collection', () => {
    const protoObject = {
        array: ['test', 1234, true, null, undefined, { abc: 'test' }],
        string: 'test',
        number: 1234,
        boolean: true,
    };

    const object = {};
    for (let i = 0; i < 5; i++) {
        object[i] = protoObject;
    }

    let string = JSON.stringify(object);
    for (let i = 0; i < 4; i++) {
        string += `Some text ${string} more text then ${string} end\n`;
    }

    const startTime = Date.now();
    const result = parseJson.toArrayOfPlainStringsOrJson(string);
    console.log('result length', result.length);
    for (let i = 0; i < result.length; i++) {
        parseJson.canParseJson(result[i]);
    }

    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(1000);
});

function assertIsJson(json) {
    let isValidJson = false;
    try {
        JSON.parse(json);
        isValidJson = true;
    } catch (e) {}
    expect(isValidJson).toBe(true);
}

const { log } = require('./index.js');

const scenario = `{\n  \"abc\": 123,\n  \"object\": {\n    \"abc\": 123,\n    \"def\": \"test\",\n    \"mystringy\": \"{\\n  \\\"2\\\": true,\\n  \\\"abc\\\": 123,\\n  \\\"def\\\": \\\"test\\\",\\n  \\\"ghi\\\": {\\n    \\\"jkl\\\": \\\"test\\\",\\n    \\\"null\\\": null,\\n    \\\"\\\": true,\\n    \\\"result\\\": \\\"{"\\\\\\\"abc\\\\\\\"":123,"\\\\\\\"def\\\\\\\"":\\\\\\\"test\\\\\\\",\\\\\\\"ghi\\\\\\\":{"\\\\\\\"zka\\\\\\\"":\\\\\\\"test\\\\\\\"}}\\\"\\n  }\\n}\"\n  }\n}`;

console.log(scenario);
gap();
log(scenario);

function gap() {
    console.log();
}

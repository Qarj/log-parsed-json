const parse = require('../index.js');
const scenario = `Line 1
Line 2 { "abc": { "abc": 123, "def": "{ hey: 1 }", "ghi": { "jkl": "test" }, "xyz": { "zzz": 123, "jj": "test", "abc": ["Circular"] } }, "def": { "zzz": 123, "jj": "test", "abc": { "abc": 123, "def": "test", "ghi": { "jkl": "test" }, "xyz": ["Circular"] } } }
Line 3`;
console.log('---SCENARIO---');
console.log(scenario);
console.log('---PRETTY JSON---');
parse.logAsJson(scenario);

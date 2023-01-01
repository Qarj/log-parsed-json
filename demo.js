const { log } = require('./index.js');

log('Hello World!');
log(123);
log(true);
log(['test']);
log({ test: 'test', test2: 2, test3: true, test4: ['test', 1, true, [2]], test5: { test: 'test' } });
log(`Some text { test: 'test' } and some more text`);
log(`some text { key1: true, 'key2': "  { inner: 'value', } " } text { a: 1 } text`);

const { toString } = require('./index.js');

console.log(toString(`{ 'k1': 'v1', 'k2': 123 }`));
console.log(toString("{ a: 'somestring', b: 42, e: { c: 82, d: [Circular *1] } }"));

const { toArrayOfPlainStringsOrJson } = require('./index.js');

console.log(toArrayOfPlainStringsOrJson(`text { 'k1': 'v1', 'k2': 123 } text { a: 1 } text`));

const { canParseJson } = require('./index.js');

console.log(canParseJson(`{ 'k1': 'v1', k2: 123 }`));
console.log(canParseJson(`{ 'k1': "v1", "k2": 123 }`));
console.log(canParseJson(`"test"`));
console.log(canParseJson(123));
console.log(canParseJson(true));

console.log();

function isJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

console.log(isJSON(`{ 'k1': 'v1', k2: 123 }`));
console.log(isJSON(`{ 'k1': "v1", "k2": 123 }`));
console.log(isJSON(`"test"`));
console.log(isJSON(123));
console.log(isJSON(true));

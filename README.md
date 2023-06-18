# log-parsed-json

[![GitHub Super-Linter](https://github.com/Qarj/log-parsed-json/workflows/Lint%20Code%20Base/badge.svg)](https://github.com/marketplace/actions/super-linter)
![Tests](https://github.com/Qarj/log-parsed-json/workflows/Tests/badge.svg)
![Publish to npmjs](https://github.com/Qarj/log-parsed-json/workflows/Publish%20to%20npmjs/badge.svg)

Pretty prints JSON like objects found in the string passed to it.

Recursively dumps JSON objects found inside other JSON objects, even if they are overly stringified.

As well as regular stringified JSON, it copes with much of the output from util.inspect() for standard JSON-like data objects, including circular references.

Escaped quotes as used in Kibana logs are handled. E.g. `{\"@metadata\": \"value\"}`

Intended to help with debugging, particulary in situations where you have for example Kibana logs containing JSON within JSON.

## Automatic Repairs to JSON

-   Change Python None to null
-   Change Python True and False to true and false
-   Insert missing commas between key-value pairs
-   Insert missing commas between array elements
-   Remove trailing commas
-   Add quotes to keys
-   Convert single quotes, backticks, curly quotes, escaped double quotes and double escaped double quotes to double quotes
-   Merge strings concatenated with a `+` to a single string

## Installation

```bash
npm install log-parsed-json
```

## Usage - pretty printing JSONs found within a string

```javascript
const { log } = require('log-parsed-json');

log(`some text { key1: true, 'key2': "  { inner: 'value', } " } text { a: 1 } text`);
```

Result

![Result](./jsonInJson.png)

## Usage - parsing a JSON like string into JSON.parse() friendly format

util.inspect()'s output is not JSON.parse() friendly.

```javascript
const { toString } = require('log-parsed-json');

console.log(toString(`{ 'k1': 'v1', 'k2': 123 }`));
```

Result

```txt
{ "k1": "v1", "k2": 123 }
```

Mentions of circular are just turned into a string, and any refs within the object are removed.

```javascript
console.log(toString("{ a: 'somestring', b: 42, e: { c: 82, d: [Circular *1] } }"));
```

Result

```txt
{ "a": "somestring", "b": 42, "e": { "c": 82, "d": ["Circular"] } }
```

## Usage - parsing a string to an array of plain strings or JSON.parse() compatible strings

```javascript
const { toArrayOfPlainStringsOrJson } = require('log-parsed-json');

console.log(toArrayOfPlainStringsOrJson(`text { 'k1': 'v1', 'k2': 123 } text { a: 1 } text`));
```

Result

```txt
[
  'text ',
  '{ "k1": "v1", "k2": 123 }',
  ' text ',
  '{ "a": 1 }',
  ' text'
]
```

## Usage - canParseJson

Returns true or false based on if `toString()` would return a valid JSON string.

```javascript
const { canParseJson } = require('log-parsed-json');

console.log(canParseJson(`{ 'k1': 'v1', k2: 123 }`));
console.log(canParseJson(`{ 'k1': "v1", "k2": 123 }`));
console.log(canParseJson(`"test"`));
console.log(canParseJson(123));
console.log(canParseJson(true));
```

Result

```json
true
true
false
false
false
```

Let's write a function and compare the response from `JSON.parse()` for the same scenarios.

```javascript
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
```

Result

```json
false
false
true
true
true
```

## Usage - firstJson

Returns the first JSON object found in the string.

```javascript
const { firstJson } = require('log-parsed-json');

console.log(firstJson(`text { 'k1': 'v1', 'k2': 123 } text { a: 1 } text`));
```

Result

```json
{ "k1": "v1", "k2": 123 }
```

## Usage - lastJson

Returns the last JSON object found in the string.

```javascript
const { lastJson } = require('log-parsed-json');

console.log(lastJson(`text { 'k1': 'v1', 'k2': 123 } text { a: 1 } text`));
```

Result

```json
{ "a": 1 }
```

## Usage - largestJson

Returns the largest JSON object found in the string.

```javascript
const { largestJson } = require('log-parsed-json');

console.log(largestJson(`text { 'k1': 'v1', 'k2': 123 } text { a: 1 } text`));
```

Result

```json
{ "k1": "v1", "k2": 123 }
```

## Usage - jsonMatching

Returns the first JSON object found in the string that matches the given regular expression.

```javascript
const { jsonMatching } = require('log-parsed-json');

console.log(jsonMatching(`text { 'k1': 'v1', 'k2': 123 } text { a: 1 } text`, /a: 1/));
```

Result

```json
{ "a": 1 }
```

## Usage - pretty print JSONs piped to `pretty`

To enable this, install `log-parsed-json` globally

```bash
npm install -g log-parsed-json
```

Now you can pipe to `pretty`

```bash
echo abc { a: 2 } abc | pretty

curl 'https://jsonplaceholder.typicode.com/todos/1' | pretty
```

## See also

Python version of this project: [https://pypi.org/project/fix-busted-json/](https://pypi.org/project/fix-busted-json/)

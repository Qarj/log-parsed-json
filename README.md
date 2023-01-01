# log-parsed-json

[![GitHub Super-Linter](https://github.com/Qarj/log-parsed-json/workflows/Lint%20Code%20Base/badge.svg)](https://github.com/marketplace/actions/super-linter)
![Tests](https://github.com/Qarj/log-parsed-json/workflows/Tests/badge.svg)
![Publish to npmjs](https://github.com/Qarj/log-parsed-json/workflows/Publish%20to%20npmjs/badge.svg)

Pretty prints JSON like objects found in the string passed to it.

Recursively dumps JSON objects found inside other JSON objects, even if they are overly stringified.

As well as regular stringified JSON, it copes with much of the output from util.inspect(), including circular references.

Intended to help with debugging.

## Installation

```bash
npm install log-parsed-json
```

## Usage

```javascript
const { log } = require('log-parsed-json');

log(`some text { key1: true, 'key2': "  { inner: 'value', } " } text { a: 1 } text`);
```

Result

![Result](./jsonInJson.png)

const log = require('../index.js');
const fs = require('fs');
const path = require('path');

const args = JSON.parse(fs.readFileSync(path.join(__dirname, './testHelperArguments.json')));

let objectToLog = {};

if (args.logObject === 1) objectToLog = ['test'];
if (args.logObject === 2) objectToLog = { test: 'test' };

if (args.value) objectToLog = args.value;

log(objectToLog);

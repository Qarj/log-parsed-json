const { log } = require('../index.js');
const fs = require('fs');
const path = require('path');

const args = JSON.parse(fs.readFileSync(path.join(__dirname, './testHelperArguments.json')));

let objectToLog = {};

if (args.value) objectToLog = args.value;

log(objectToLog);

// console.log('---TEST HELPER---');
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { log } from '../index.js';

// console.log('---TEST HELPER---');

// Convert the URL to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let args;
try {
    args = JSON.parse(fs.readFileSync(path.join(__dirname, './testHelperArguments.json')));
} catch (e) {
    // console.log('error reading file', e);
    args = {};
}

// console.log('args', args);

let objectToLog = {};

if (args.value) objectToLog = args.value;

console.log('objectToLog', objectToLog);

log(objectToLog);

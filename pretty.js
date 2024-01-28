#!/usr/bin/env node

import { log } from './index.js';

let data = '';

async function main() {
    for await (const chunk of process.stdin) data += chunk;

    log(data);
}

main();

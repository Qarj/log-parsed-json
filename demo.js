const { log } = require('./index.js');

log('Hello World!');
log(123);
log(true);
log(['test']);
log({ test: 'test', test2: 2, test3: true, test4: ['test', 1, true, [2]], test5: { test: 'test' } });
log(`Some text { test: 'test' } and some more text`);

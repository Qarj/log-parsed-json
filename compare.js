const log = require('./index.js');

console.log(true);
log(true);
gap();

console.log(123);
log(123);
gap();

console.log(['test', { test: 'test' }]);
log(['test', { test: 'test' }]);
gap();

console.log({ test: 'test' });
log({ test: 'test' });
gap();

console.log("{ test: 'test', array: ['test', { test: 'test' }] }");
log("{ test: 'test', array: ['test', { test: 'test' }] }");
gap();

console.log("some text { test: 'test', array: ['test', { test: 'test' }] } more text");
log("some text { test: 'test', array: ['test', { test: 'test' }] } more text");
gap();

console.log('real json {"value":["test"]}');
log('real json {"value":["test"]}');
gap();

function gap() {
    console.log();
}

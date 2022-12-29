const log = require('../index.js');

test('log function exists', () => {
    expect(log).toBeDefined();
});

test('log function is a function', () => {
    expect(typeof log).toBe('function');
});

test('log function returns undefined', () => {
    expect(log()).toBeUndefined();
});

test('log function logs a string', () => {
    const spy = jest.spyOn(console, 'log');
    log('test');
    expect(spy).toHaveBeenCalledWith("'test'");
});

test('log function logs a number', () => {
    const spy = jest.spyOn(console, 'log');
    log(123);
    expect(spy).toHaveBeenCalledWith('123');
});

test('log function logs a boolean', () => {
    const spy = jest.spyOn(console, 'log');
    log(true);
    expect(spy).toHaveBeenCalledWith('true');
});

test('log function logs an object', () => {
    const spy = jest.spyOn(console, 'log');
    log({ test: 'test' });
    expect(spy).toHaveBeenCalledWith("{ test: 'test' }");
});

test('log function logs an array', () => {
    const spy = jest.spyOn(console, 'log');
    log(['test']);
    expect(spy).toHaveBeenCalledWith("[ 'test' ]");
});

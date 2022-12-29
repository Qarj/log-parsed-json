const log = require('../index.js');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    try {
        fs.unlinkSync(path.join(__dirname, './testHelper.json'));
    } catch (e) {}
});

test('log function exists', (done) => {
    expect(log).toBeDefined();
    done();
});

test('log function is a function', (done) => {
    expect(typeof log).toBe('function');
    done();
});

test('log function returns undefined', (done) => {
    expect(log()).toBeUndefined();
    done();
});

test('log function logs a string', (done) => {
    const positiveAssertions = ['abcd'];
    const negativeAssertions = [];
    const expectedCalls = 2;
    setTestHelperArguments({ value: 'abcd' });
    testRunner(positiveAssertions, negativeAssertions, expectedCalls, done);
});

test('log function logs a number', (done) => {
    const positiveAssertions = ['123'];
    const negativeAssertions = [];
    const expectedCalls = 2;
    setTestHelperArguments({ value: 123 });
    testRunner(positiveAssertions, negativeAssertions, expectedCalls, done);
});

test('log function logs a boolean', (done) => {
    const positiveAssertions = ['true'];
    const negativeAssertions = ["''", ']'];
    const expectedCalls = 2;
    setTestHelperArguments({ value: true });
    testRunner(positiveAssertions, negativeAssertions, expectedCalls, done);
});

test('log function logs an object', (done) => {
    const positiveAssertions = ["'test'", '{', '}'];
    const negativeAssertions = ["''", ']'];
    const expectedCalls = 2;
    setTestHelperArguments({ logObject: 2 });
    testRunner(positiveAssertions, negativeAssertions, expectedCalls, done);
});

test('log function logs an array alternate', (done) => {
    const positiveAssertions = ["'test'", '[', ']', '32m'];
    const negativeAssertions = ["''", '{', '}'];
    const expectedCalls = 1;
    setTestHelperArguments({ logObject: 1 });
    testRunner(positiveAssertions, negativeAssertions, expectedCalls, done);
});

const testRunner = (postiveAssertions, negativeAssertions, expectedCalls, done) => {
    // https://nikhilvijayan.com/testing-stdout-in-node-js-jest

    const testAppFilePath = path.join(__dirname, './testHelper.js');
    const testApp = spawn('node', [testAppFilePath]);

    testApp.stdout.on('data', (data) => {
        const finish = () => {
            testApp.kill('SIGINT');
            done();
        };
        let consoleData = { stdoutData: '', called: 0 };
        try {
            consoleData = JSON.parse(fs.readFileSync(path.join(__dirname, './testHelper.json'), 'utf8'));
        } catch (e) {}
        consoleData.stdoutData += data.toString();
        consoleData.called++;
        fs.writeFileSync(path.join(__dirname, './testHelper.json'), JSON.stringify(consoleData));
        if (consoleData.called < expectedCalls) return finish();

        for (const assertion of postiveAssertions) expect(consoleData.stdoutData).toMatch(assertion);
        for (const assertion of negativeAssertions) expect(consoleData.stdoutData).not.toMatch(assertion);

        finish();
    });
};

function setTestHelperArguments(args) {
    fs.writeFileSync(path.join(__dirname, './testHelperArguments.json'), JSON.stringify(args));
}

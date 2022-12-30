const log = require('../index.js');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    try {
        fs.unlinkSync(path.join(__dirname, './testHelperCalls.json'));
    } catch (e) {}
    try {
        fs.unlinkSync(path.join(__dirname, './testHelperCalls.json'));
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

test('log function logs a string', (done) => {
    const positiveAssertions = ['abcd'];
    const negativeAssertions = [];
    setTestHelperArguments({ value: 'abcd' });
    testRunner(positiveAssertions, negativeAssertions, done);
});

test('log function logs a number', (done) => {
    const positiveAssertions = ['123'];
    const negativeAssertions = [];
    setTestHelperArguments({ value: 123 });
    testRunner(positiveAssertions, negativeAssertions, done);
});

test('log function logs a boolean', (done) => {
    const positiveAssertions = ['true'];
    const negativeAssertions = ["''", ']'];
    setTestHelperArguments({ value: true });
    testRunner(positiveAssertions, negativeAssertions, done);
});

test('log function logs an object', (done) => {
    const positiveAssertions = ["'test'", '{', '}'];
    const negativeAssertions = ["''", ']'];
    setTestHelperArguments({ value: { test: 'test' } });
    testRunner(positiveAssertions, negativeAssertions, done);
});

test('log function logs an array', (done) => {
    const positiveAssertions = ["'test'", '[', ']', '32m'];
    const negativeAssertions = ["''", '{', '}'];
    setTestHelperArguments({ value: ['test'] });
    testRunner(positiveAssertions, negativeAssertions, done);
});

const testRunner = (postiveAssertions, negativeAssertions, done) => {
    // https://nikhilvijayan.com/testing-stdout-in-node-js-jest

    const testAppFilePath = path.join(__dirname, './testHelper.js');
    const testApp = spawn('node', [testAppFilePath]);

    testApp.stdout.on('data', async (data) => {
        const finish = () => {
            testApp.kill('SIGINT');
            done();
        };
        let calls = { stdoutData: '', called: 0 };
        try {
            calls = JSON.parse(fs.readFileSync(path.join(__dirname, './testHelperCalls.json'), 'utf8'));
        } catch (e) {}
        calls.stdoutData += data.toString();
        calls.called++;
        const iAmCallNumber = calls.called;
        fs.writeFileSync(path.join(__dirname, './testHelperCalls.json'), JSON.stringify(calls));
        await sleep(5); // expect all console.log calls to be done
        try {
            calls = JSON.parse(fs.readFileSync(path.join(__dirname, './testHelperCalls.json'), 'utf8'));
        } catch (e) {}
        try {
            calls = JSON.parse(fs.readFileSync(path.join(__dirname, './testHelperCalls.json'), 'utf8'));
        } catch (e) {}
        if (calls.called > iAmCallNumber) return finish();

        for (const assertion of postiveAssertions) expect(calls.stdoutData).toMatch(assertion);
        for (const assertion of negativeAssertions) expect(calls.stdoutData).not.toMatch(assertion);

        finish();
    });
};

function setTestHelperArguments(args) {
    fs.writeFileSync(path.join(__dirname, './testHelperArguments.json'), JSON.stringify(args));
}

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

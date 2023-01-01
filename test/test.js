const { log } = require('../index.js');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

try {
    const files = fs.readdirSync('./test/temp');
    for (const file of files) {
        fs.unlinkSync(path.join('./test/temp', file));
    }
} catch (e) {}
try {
    fs.rmdirSync('./test/temp', { maxRetries: 10 });
} catch (e) {}
try {
    fs.mkdirSync('./test/temp');
} catch (e) {}

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
    const positiveAssertions = ["{ test: 'test' }"];
    const negativeAssertions = ["''", ']'];
    setTestHelperArguments({ value: { test: 'test' } });
    testRunner(positiveAssertions, negativeAssertions, done);
});

test('log function logs an array - check ansi', (done) => {
    const positiveAssertions = ["'test'", '[', ']', '32m'];
    const negativeAssertions = ["''", '{', '}'];
    setTestHelperArguments({ value: ['test'] });
    testRunner(positiveAssertions, negativeAssertions, done, false);
});

test('log function logs an array', (done) => {
    const positiveAssertions = ["[ 'test' ]"];
    const negativeAssertions = ["''", '{', '}'];
    setTestHelperArguments({ value: ['test'] });
    testRunner(positiveAssertions, negativeAssertions, done);
});

test('should log inspect string output with colours', (done) => {
    setTestHelperArguments({ value: "{ test: 'test', array: ['test', { test: 'test' }] }" });
    const positiveAssertions = ['32m'];
    const negativeAssertions = [];
    testRunner(positiveAssertions, negativeAssertions, done, false);
});

test('should log broken json string followed by correct json', (done) => {
    setTestHelperArguments({ value: 'text { "test": "bad  { "test": "good" } some text' });
    const positiveAssertions = ['"test"', '32m'];
    const negativeAssertions = [];
    testRunner(positiveAssertions, negativeAssertions, done, false);
});

test('should log broken json prmitive followed by correct json', (done) => {
    setTestHelperArguments({ value: 'text { "test": 123  { "test": "good" } some text' });
    const positiveAssertions = ['"test"', '32m'];
    const negativeAssertions = [];
    testRunner(positiveAssertions, negativeAssertions, done, false);
});

test('should log json in json with colours', (done) => {
    setTestHelperArguments({
        value: `{
    mykey: '{ "first": 323, "second": false, "3": null }',
    other: 12345
}`,
    });
    const positiveAssertions = ['mykey', '32m', '33m1', '33m3'];
    const negativeAssertions = [];
    testRunner(positiveAssertions, negativeAssertions, done, false);
});

const testRunner = (postiveAssertions, negativeAssertions, done, stripAnsi = true) => {
    // https://nikhilvijayan.com/testing-stdout-in-node-js-jest

    const testAppFilePath = path.join(__dirname, './testHelper.js');
    const testApp = spawn('node', [testAppFilePath]);
    const randomInt = Math.floor(Math.random() * 1000000);
    const testHelperCallsFilePath = path.join(__dirname, `./temp/testHelperCalls${randomInt}.json`);

    testApp.stdout.on('data', async (data) => {
        const finish = () => {
            testApp.kill('SIGINT');
            done();
        };
        let calls = { stdoutData: '', called: 0 };
        try {
            calls = JSON.parse(fs.readFileSync(testHelperCallsFilePath, 'utf8'));
        } catch (e) {}
        calls.stdoutData += data.toString();
        calls.called++;
        const iAmCallNumber = calls.called;
        fs.writeFileSync(testHelperCallsFilePath, JSON.stringify(calls));
        await sleep(6); // expect all console.log calls to be done
        try {
            calls = JSON.parse(fs.readFileSync(testHelperCallsFilePath, 'utf8'));
        } catch (e) {}
        if (calls.called > iAmCallNumber) return finish();

        if (stripAnsi) calls.stdoutData = calls.stdoutData.replace(/\u001b\[[0-9]{1,2}m/g, '');

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

export default {
    testEnvironment: 'node',
    transform: {
        '^.+\\.[t|j]sx?$': 'babel-jest',
    },
    testTimeout: 10000,
};

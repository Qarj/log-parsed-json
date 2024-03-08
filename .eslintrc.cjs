module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: 'eslint:recommended',
    overrides: [
        {
            env: {
                node: true,
            },
            files: ['.eslintrc.{js,cjs}'],
            parserOptions: {
                sourceType: 'script',
            },
        },
        {
            files: ['*.test.js', '*.spec.js'],
            env: {
                jest: true,
            },
        },
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        'linebreak-style': ['error', 'unix'],
        // 'quotes': ['error', 'single', { allowTemplateLiterals: true }],
        'semi': ['error', 'always'],
        'no-unused-vars': 'off',
    },
};

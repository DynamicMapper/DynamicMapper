module.exports = {
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.spec.json'
        }
    },
    roots: [
        '<rootDir>/test'
    ],
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
};

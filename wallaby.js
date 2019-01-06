module.exports = function(wallaby) {
    return {
        files: [
            'lib/**/*.ts',
            './setupTests.ts',
            { pattern: 'lib/**/__tests__/**/*.ts', ignore: true },
            { pattern: '.secrets/**', binary: true, instrument: false },
            { pattern: '.env', binary: true, instrument: false }
        ],
        tests: ['lib/**/__tests__/**/*.ts'],

        compilers: {
            '**/*.ts': wallaby.compilers.typeScript()
        },

        env: {
            type: 'node',
            runner: 'node',
            params: {
                env: `BASE_PATH=${__dirname}`
            }
        },

        testFramework: 'jest',
        lazy: true,

        setup: function(wallaby) {
            const jestConfig = require('./package.json').jest;
            wallaby.testFramework.configure(jestConfig);
        }
    };
};

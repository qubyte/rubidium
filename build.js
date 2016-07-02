'use strict';

const rollup = require('rollup');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');

const config = {
    entry: 'lib/Rubidium.js',
    plugins: [
        nodeResolve({
            jsnext: true,
            main: true
        }),

        commonjs({
            include: 'node_modules/**',
            ignoreGlobal: true
        })
    ]
};

module.exports = rollup.rollup(config)
    .then(bundle => {
        bundle.write({
            format: 'umd',
            moduleName: 'Rubidium',
            dest: 'build/rubidium.umd.js'
        });

        bundle.write({
            format: 'es6',
            dest: 'build/rubidium.es6.js'
        });
    })
    .catch(console.error); // eslint-disable-line no-console

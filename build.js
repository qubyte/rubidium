'use strict';

const rollup = require('rollup');
const nodeResolve = require('rollup-plugin-node-resolve');

const plugins = [
    nodeResolve({ jsnext: true })
];

function buildProduction() {
    return rollup.rollup({ entry: 'lib/Rubidium.js', plugins })
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
}

function buildTest() {
    const rubidiumPromise = rollup.rollup({ entry: 'lib/Rubidium.js', plugins })
        .then(bundle => bundle.write({ format: 'cjs', dest: 'build/rubidium.common.js' }));

    const uuidPromise = rollup.rollup({ entry: 'lib/uuidv4' })
        .then(bundle => bundle.write({ format: 'cjs', dest: 'build/uuidv4.common.js' }));

    return Promise.all([rubidiumPromise, uuidPromise])
        .catch(console.error); // eslint-disable-line no-console
}

module.exports = process.argv.indexOf('test') === -1 ? buildProduction() : buildTest();

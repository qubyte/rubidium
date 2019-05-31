'use strict';

const rollup = require('rollup');
const nodeResolve = require('rollup-plugin-node-resolve');

const plugins = [
  nodeResolve({ modulesOnly: true })
];

async function buildProduction() {
  const bundle = await rollup.rollup({ input: 'lib/Rubidium.js', plugins });

  await Promise.all([
    bundle.write({
      format: 'umd',
      name: 'Rubidium',
      file: 'build/rubidium.umd.js'
    }),

    bundle.write({
      format: 'es',
      file: 'build/rubidium.es6.js'
    })
  ]);
}

function buildTest() {
  const rubidiumPromise = rollup.rollup({ input: 'lib/Rubidium.js', plugins })
    .then(bundle => bundle.write({ format: 'cjs', file: 'build/rubidium.common.js' }));

  const uuidPromise = rollup.rollup({ input: 'lib/uuidv4' })
    .then(bundle => bundle.write({ format: 'cjs', file: 'build/uuidv4.common.js' }));

  return Promise.all([rubidiumPromise, uuidPromise])
    .catch(console.error); // eslint-disable-line no-console
}

module.exports = process.argv.indexOf('test') === -1 ? buildProduction() : buildTest();

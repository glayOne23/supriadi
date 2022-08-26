'use strict'

const path = require('path')
const babel = require('rollup-plugin-babel')
// const resolve = require('rollup-plugin-node-resolve')
const banner = require('./banner.js')

// const BUNDLE = process.env.BUNDLE === 'true'
const ESM = process.env.ESM === 'true'

const fileDest = `ace${ESM ? '.esm' : ''}`
const external = ['jquery', 'bootstrap', 'EventHandler']
const plugins = [
  babel({
  // Only transpile our source code
    exclude: 'node_modules/**'
    // Include only required helpers

  })
]
const globals = {
  jquery: 'jQuery',
  bootstrap: 'bootstrap',
  EventHandler: 'EventHandler'
}

/**
if (BUNDLE) {
  fileDest += '.bundle'
  // Remove last entry in external array to bundle Popper
  external.pop()
  delete globals['popper.js']
  plugins.push(resolve())
}
*/

const rollupConfig = {
  input: path.resolve(__dirname, `../js/src/index${ESM ? '.esm' : '.umd'}.js`),
  output: {
    banner,
    file: path.resolve(__dirname, `../dist/js/${fileDest}.js`),
    format: ESM ? 'esm' : 'umd',
    globals
  },
  external,
  plugins
}

if (!ESM) {
  rollupConfig.output.name = 'AceApp'
}

module.exports = rollupConfig

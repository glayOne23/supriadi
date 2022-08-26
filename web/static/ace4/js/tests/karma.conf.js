/* eslint-env node */
/* eslint no-process-env: 0 */

let files = [
  '../../node_modules/jquery/dist/jquery.slim.js',
  '../../node_modules/bootstrap/dist/css/bootstrap.css',
  '../../node_modules/bootstrap/dist/js/bootstrap.bundle.js',
  '../../dist/css/ace.css',
  '../../dist/js/ace.js'
]

files = files.concat(['unit/*.js'])

module.exports = function (config) {
  config.set({
    frameworks: ['qunit', 'viewport'],
    plugins: ['karma-qunit', 'karma-viewport', 'karma-chrome-launcher'],

    browsers: ['Chrome'],

    reporters: ['progress'],
    files: files,

    restartOnFileChange: true,
    singleRun: true,
    concurrency: Infinity
  })
}

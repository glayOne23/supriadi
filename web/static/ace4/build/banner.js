'use strict'

const pkg = require('../package.json')
const year = new Date().getFullYear()

function getBanner (pluginFilename) {
  return `/*!
  * Ace Admin Template v${pkg.version}
  * Copyright 2013-${year}
  * You need a commercial license to use this product
  * ${pkg.homepage}
  */`
}

module.exports = getBanner

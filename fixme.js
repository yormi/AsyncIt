'use strict'

let path = require('path')

let fixme = require('fixme')

fixme({
  path: path.join(__dirname, '.'),
  ignored_directories: [
    'server_build/**',
    'node_modules/**',
    'node_modules/babel-plugin-transform-regenerator/.test/**',
    '**/.*/**',
    'public/**',

    '.git/**'
  ],
  file_patterns: [
    '*.js'
  ]
})

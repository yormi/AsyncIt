'use strict'

let path = require('path')

let fixme = require('fixme')

fixme({
  path: path.join(__dirname, '.'),
  ignored_directories: [
    'node_modules/**',
    '**/.*/**',
    '.git/**'
  ],
  file_patterns: [
    '*.js'
  ]
})

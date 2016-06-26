'use strict'

import jsdom from 'jsdom'

const init = () => {
  const doc = jsdom.jsdom('<!doctype html><html><body></body></html>', {
    url: 'http://localhost'
  })
  const win = doc.defaultView

  win.localStorage = win.sessionStorage = {
    getItem: function (key) {
      return this[key]
    },
    setItem: function (key, value) {
      this[key] = value
    },
    removeItem: function (key) {
      delete this[key]
    }
  }

  global.document = doc
  global.window = win

  Object.keys(window).forEach((key) => {
    if (!(key in global)) {
      global[key] = window[key]
    }
  })
}

init()
export default init

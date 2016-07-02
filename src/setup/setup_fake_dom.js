'use strict'

import jsdom from 'jsdom'

export default function initializeDom () {
  if (typeof document !== 'undefined') return
  const doc = createGlobalDocument()
  const win = createGlobalWindow(doc)
  assignWindowKeyToGlobal(win)
}

export const reinitializeDom = () => {
  const doc = createGlobalDocument()
  const win = createGlobalWindow(doc)
  assignWindowKeyToGlobal(win)
}

const createGlobalDocument = () => {
  const doc = jsdom.jsdom('<!doctype html><html><body></body></html>', {
    url: 'http://localhost'
  })

  global.document = doc

  return doc
}

const createGlobalWindow = (doc) => {
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

  global.window = win

  return win
}

const assignWindowKeyToGlobal = (win) => {
  Object.keys(win).forEach((key) => {
    if (!(key in global)) {
      global[key] = win[key]
    }
  })
}

initializeDom()

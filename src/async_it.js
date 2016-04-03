'use strict'

/* global it */

import assert from 'assert'

export function asyncIt (description, test, option) {
  async function fn (done) {
    function enhancedDone (text) {
      cleanDom()
      done(text)
    }

    try {
      await test(enhancedDone)
    } catch (err) {
      enhancedDone(err)
    }
  }

  switch (option) {
    case 'only':
      it.only(description, fn)
      break
    case 'skip':
      it.skip(description, fn)
      break
    default:
      it(description, fn)
  }
}

function cleanDom () {
  try {
    if (renderedApp) {
      unmountComponentAtNode(findDOMNode(renderedApp).parentNode)
    }
  } catch (err) {
    console.info('Error while cleaning the dom: ', err)
  }
  renderedApp = null
}

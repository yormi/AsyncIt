'use strict'

/* global it */

import {
  renderIntoDocument
} from 'react-addons-test-utils'
import {
  unmountComponentAtNode,
  findDOMNode
} from 'react-dom'

let renderedApp

export const renderApp = (rootElement) => {
  renderedApp = renderIntoDocument(rootElement)
  return renderedApp
}

export const asyncIt = (description, test, option) => {
  const decoratedTest = _decorateTest(test)

  switch (option) {
    case 'only':
      it.only(description, decoratedTest)
      break
    case 'skip':
      it.skip(description, decoratedTest)
      break
    default:
      it(description, decoratedTest)
  }
}

export const _decorateTest = (test) => {
  return async (done) => {
    const enhancedDone = (err) => {
      _cleanDom()
      done(err)
    }

    try {
      await test(enhancedDone)
    } catch (err) {
      enhancedDone(err)
    }
  }
}

export function _cleanDom () {
  try {
    if (renderedApp) {
      unmountComponentAtNode(findDOMNode(renderedApp).parentNode)
      renderedApp = null
    }
  } catch (err) {
    console.info('Error while cleaning the dom: ', err)
  }
}

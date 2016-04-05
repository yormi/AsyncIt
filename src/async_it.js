'use strict'

/* global it */

import React from 'react'
import {
  renderIntoDocument
} from 'react-addons-test-utils'
import wrapReactLifecycleMethodsWithTryCatch, { config } from 'react-component-errors'
import {
  unmountComponentAtNode,
  findDOMNode
} from 'react-dom'

config.errorHandler = (errorReport) => {
  throw errorReport.error
}

let renderedApp

export const renderApp = (RootComponent, props) => {
  wrapReactLifecycleMethodsWithTryCatch(RootComponent)
  renderedApp = renderIntoDocument(<RootComponent {...props} />)
  return renderedApp
}

export const asyncIt = (description, test) => {
  const decoratedTest = _decorateTest(test)
  it(description, decoratedTest)
}

asyncIt.only = (description, test) => {
  const decoratedTest = _decorateTest(test)
  it.only(description, decoratedTest)
}

asyncIt.skip = (description, test) => {
  const decoratedTest = _decorateTest(test)
  it.skip(description, decoratedTest)
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

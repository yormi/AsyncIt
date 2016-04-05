'use strict'

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

export const getRenderedApp = () => renderedApp

export const mountApp = (RootComponent, props) => {
  wrapReactLifecycleMethodsWithTryCatch(RootComponent)
  renderedApp = renderIntoDocument(<RootComponent {...props} />)
  return renderedApp
}

export const unmountApp = () => {
  try {
    if (renderedApp) {
      unmountComponentAtNode(findDOMNode(renderedApp).parentNode)
      renderedApp = null
    }
  } catch (err) {
    console.info('Error while cleaning the dom: ', err)
  }
}

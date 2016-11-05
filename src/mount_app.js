'use strict'

import React from 'react'
import {
  scryRenderedComponentsWithType,
  renderIntoDocument
} from 'react-addons-test-utils'
import {
  unmountComponentAtNode,
  findDOMNode
} from 'react-dom'

import initializeDom from '~/src/setup/setup_fake_dom'
import {
  wrapLifecycleMethodsWithTryCatch
} from '~/src/handler_react_component_lifecycle_error'

let mountedApp
let router

export const getMountedApp = () => mountedApp
export const getRouterComponent = () => {
  const router = getReactRouter()

  try {
    const routersFound = scryRenderedComponentsWithType(mountedApp, router)

    if (routersFound.length !== 1) throw routersFound.length

    return routersFound[0]
  } catch (err) {
    if (typeof err === 'number') {
      throw new Error(`There is not only one react-router Router component but ${err}.`)
    } else {
      throw err
    }
  }
}

const getReactRouter = () => {
  if (!router) {
    try {
      router = require('react-router').StaticRouter
    } catch (err) {
      throw new Error('"react-router" must be install in your project. Otherwise, test-them-all routing feature doesn\'t make sense. Make sure you have react-router v4. If you do not want to use the version 4 downgrad test-them-all package to a version below 3.')
    }
  }

  return router
}

export const mountApp = (RootComponent, props = {}, renderFn = renderIntoDocument) => {
  wrapLifecycleMethodsWithTryCatch(RootComponent)
  mountedApp = renderFn(<RootComponent {...props} />)
  return mountedApp
}

export const unmountApp = () => {
  try {
    if (mountedApp) {
      unmountComponentAtNode(findDOMNode(mountedApp).parentNode)
      mountedApp = null
    }
    initializeDom()
  } catch (err) {
    console.info('Error while cleaning the dom: ', err)
  }
}

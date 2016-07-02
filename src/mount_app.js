'use strict'

import React from 'react'
import {
  findRenderedComponentWithType,
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
let Router

export const getMountedApp = () => mountedApp
export const getRouterComponent = () => {
  const Router = getReactRouter()

  try {
    const a = findRenderedComponentWithType(mountedApp, Router)
    return a
  } catch (err) {
    const routers = scryRenderedComponentsWithType(mountedApp, Router)
    throw new Error(`There is not only one react-router Router component but ${routers.length}.`)
  }
}

const getReactRouter = () => {
  if (!Router) {
    try {
      Router = require('react-router').Router
    } catch (err) {
      throw new Error('"react-router" must be install in your project. Otherwise, test-them-all routing feature doesn\'t make sense')
    }
  }

  return Router
}

export const mountApp = (RootComponent, props) => {
  wrapLifecycleMethodsWithTryCatch(RootComponent)
  mountedApp = renderIntoDocument(<RootComponent {...props} />)
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

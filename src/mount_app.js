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
import { Router } from 'react-router'

import {
  wrapLifecycleMethodsWithTryCatch
} from '~/src/handler_react_component_lifecycle_error'

let mountedApp

export const getMountedApp = () => mountedApp
export const getRouterComponent = () => {
  try {
    return findRenderedComponentWithType(mountedApp, Router)
  } catch (err) {
    const routers = scryRenderedComponentsWithType(mountedApp, Router)
    throw new Error(`There is not only one react-router Router component but ${routers.length}.`)
  }
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
  } catch (err) {
    console.info('Error while cleaning the dom: ', err)
  }
}

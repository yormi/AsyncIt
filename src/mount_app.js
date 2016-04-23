'use strict'

import React from 'react'
import {
  findRenderedComponentWithType,
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
export const getRouterComponent = (app) => findRenderedComponentWithType(mountedApp, Router)

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

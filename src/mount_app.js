'use strict'

import React from 'react'
import {
  renderIntoDocument
} from 'react-addons-test-utils'
import {
  wrapLifecycleMethodsWithTryCatch
} from '~/src/handler_react_component_lifecycle_error'
import {
  unmountComponentAtNode,
  findDOMNode
} from 'react-dom'

let mountedApp

export const getMountedApp = () => mountedApp

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

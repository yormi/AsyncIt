'use strict'

import {
  noMoreReject,
  setCurrentReject
} from '~/src/handler_react_component_lifecycle_error'
import {
  getMountedApp,
  getRouterComponent
} from '~/src/mount_app'
import {
  listenOnComponentDidUpdate,
  restoreComponentDidUpdate
} from '~/src/utils/component_did_update_util'

export default class {
  constructor () {
    const FIRST_RENDER = () => true

    this._readyWhen = FIRST_RENDER
    this._component = getMountedApp()
    this._isDebugModeOn = false
    this._debugFunction = defaultDebugFunction
    this._trigger
  }

  debug () {
    this._isDebugModeOn = true
    return this
  }

  listenOn (component) {
    this._component = component
    return this
  }

  trigger (triggerFunction) {
    if (typeof triggerFunction !== 'function') {
      throw new Error('The trigger should be a functioni. This function has to trigger the route change')
    }

    this._trigger = triggerFunction
    return this
  }

  waitProps (testFunction) {
    if (typeof testFunction !== 'function') {
      throw new Error('The provided test should be a function that returns true when the props are in the wanted state')
    }

    this._readyWhen = testFunction
    return this
  }

  waitState (testFunction) {
    if (typeof testFunction !== 'function') {
      throw new Error('The provided test should be a function that returns true when the props are in the wanted state')
    }

    this._readyWhen = testFunction
    return this
  }

  waitRoute (targetRoutePath) {
    if (typeof this._trigger !== 'function') {
      throw new Error('The trigger should be a function that will trigger the route change')
    }

    const router = getRouterComponent()

    this._component = router
    this._readyWhen = () => router.state.location.pathname === targetRoutePath
    this._debugFunction = () => console.info('DEBUG :: Router location:', router.state.location.pathname)

    return this._promiseFactory()
  }

  _promiseFactory () {
    return new Promise((resolve, reject) => {
      this._setUpListener(resolve, reject)

      setCurrentReject((error) => {
        restore(this._component)
        reject(error)
      })

      this._trigger()
    })
  }

  _setUpListener (resolve, reject) {
    listenOnComponentDidUpdate(this._component, () => {
      try {
        this._debug()

        if (this._readyWhen()) {
          restore(this._component)
          resolve()
        }
      } catch (err) {
        restore(this._component)
        reject(err)
      }
    })
  }

  _debug () {
    if (this._isDebugModeOn) {
      this._debugFunction(this._component)
    }
  }
}

const restore = (component) => {
  restoreComponentDidUpdate(component)
  noMoreReject()
}

const defaultDebugFunction = (component, isDebugModeOn) => {
  if (isDebugModeOn) {
    const propsKeys = Object.keys(component.props)
    const functionPropsName = propsKeys.filter((key) => typeof component.props[key] === 'function')

    console.info('DEBUG ::')
    console.info('State:\n', JSON.stringify(component.state, null, '    '))
    console.info('Props:\n', JSON.stringify(component.props, null, '    '))
    console.info('Function props:\n', functionPropsName)
    console.info('\n\n')
  }
}

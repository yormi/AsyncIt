'use strict'

import {
  isCompositeComponent
} from 'react-addons-test-utils'

import actionLogger from '~/src/action_logger'
import {
  noMoreReject,
  setCurrentReject
} from '~/src/handler_react_component_lifecycle_error'
import {
  getRouterComponent
} from '~/src/mount_app'
import {
  listenOnComponentDidUpdate,
  restoreComponentDidUpdate
} from '~/src/utils/component_did_update_util'

export function InvariantError (message) {
  this.name = 'InvariantError'
  this.message = message
  this.stack = (new Error()).stack
}
InvariantError.prototype = Object.create(Error.prototype)
InvariantError.prototype.constructor = InvariantError

const FIRST_RENDER = () => true

export default class AsyncAction {
  constructor (actionDescription) {
    if (actionLogger.shouldLogActions()) {
      console.info('ACTION: ' + actionDescription)
    }

    this._readyWhen = FIRST_RENDER
    this._component
    this.isActionDebugModeOn = false
    this._debugFunction
    this._trigger
  }

  debug (debugFunction) {
    if (typeof debugFunction === 'function') {
      this._debugFunction = debugFunction
    } else if (debugFunction) {
      throw new InvariantError('The "debug function" provided is not a function')
    }

    this.isActionDebugModeOn = true
    return this
  }

  listenOn (component) {
    this._component = component
    return this
  }

  trigger (triggerFunction) {
    if (typeof triggerFunction !== 'function') {
      throw new Error('The trigger should be a function. This function should bring to the wanted state or the AsyncAction will hang there')
    }

    this._trigger = triggerFunction
    return this
  }

  async waitProps (testFunction) {
    const component = this._component
    this._readyWhen = () => testFunction(component.props)
    this._invariants()
    return await this._lunchAction()
  }

  async waitState (testFunction) {
    const component = this._component
    this._readyWhen = () => testFunction(component.state)
    this._invariants()
    return await this._lunchAction()
  }

  async waitRoute (targetRoutePathOrFn) {
    if (this._component) {
      console.warn('The listenOn you provided will be ignore since we listen for the router to change route')
    }

    const router = getRouterComponent()

    this._component = router
    this._readyWhen = this._getRouteTestFunction(router, targetRoutePathOrFn)
    this._debugFunction = () => console.info('DEBUG :: Router location:', router.state.location.pathname)

    this._invariants()

    return await this._lunchAction()
  }

  _getRouteTestFunction (router, targetRoutePathOrFn) {
    if (typeof targetRoutePathOrFn === 'string') {
      const targetRoutePath = targetRoutePathOrFn
      return () => router.props.location.pathname === targetRoutePath
    } else {
      const testFunction = () => {
        return targetRoutePathOrFn(router.props.location.pathname)
      }
      return testFunction
    }
  }

  _invariants () {
    if (!this._component) {
      throw new InvariantError('A component must be provided so that the action can hook on his componentDidUpdate')
    }

    if (!isCompositeComponent(this._component)) {
      throw new InvariantError('The provided component is not a React composite component. A normal DOM element does not allow to hook on it\'s updates')
    }

    if (typeof this._readyWhen !== 'function') {
      throw new InvariantError('The provided test should be a function. This function should returns true when the props are in the wanted state')
    }
  }

  async _lunchAction () {
    if (!this._trigger) {
      this._debug()
      if (this._readyWhen()) {
        return
      }
    }

    const promise = this._promiseFactory()

    if (this._trigger) {
      await this._trigger()
    }

    return promise
  }

  _promiseFactory () {
    return new Promise((resolve, reject) => {
      this._setUpListener(resolve, reject)

      setCurrentReject((error) => {
        restore(this._component)
        reject(error)
      })
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

  _debug (defaultDebug = defaultDebugFunction) {
    const debugFunction = this._debugFunction || defaultDebug

    if (this.isActionDebugModeOn) {
      console.info('----- DEBUG -----')
      debugFunction(this._component)
      console.info('\n')
    }
  }
}

const restore = (component) => {
  restoreComponentDidUpdate(component)
  noMoreReject()
}

const defaultDebugFunction = (component) => {
  console.info('State:\n', component.state)
  console.info('Props:\n', component.props)
  console.info('\n\n')
}

'use strict'

import {
  noMoreReject,
  setCurrentReject
} from '~/src/handler_react_component_lifecycle_error'
import {
  getMountedApp
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
  }

  debug () {
    this._isDebugModeOn = true
    return this
  }

  listenOn (component) {
    this._component = component
    return this
  }

  readyWhen (testFunction) {
    this._readyWhen = testFunction
    return this
  }

  triggerWith (actionFunction) {
    const self = this
    return new Promise(function (resolve, reject) {
      self._setUpListener(resolve, reject)
      setCurrentReject((error) => {
        restore(self._component)
        reject(error)
      })
      actionFunction()
    })
  }

  _setUpListener (resolve, reject) {
    listenOnComponentDidUpdate(this._component, () => {
      try {
        debug(this._component, this._isDebugModeOn)

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
}

const restore = (component) => {
  restoreComponentDidUpdate(component)
  noMoreReject()
}

const debug = (component, isDebugModeOn) => {
  if (isDebugModeOn) {
    const propsKeys = Object.keys(component.props)
    const functionPropsName = propsKeys.filter((key) => typeof component.props[key] === 'function')

    console.info('State:\n', JSON.stringify(component.state, null, '    '))
    console.info('Props:\n', JSON.stringify(component.props, null, '    '))
    console.info('Function props:\n', functionPropsName)
    console.info('\n\n')
  }
}

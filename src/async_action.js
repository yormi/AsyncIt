'use strict'

import {
  isCompositeComponent
} from 'react-addons-test-utils'

import {
  listenOnComponentDidUpdate
} from '~/src/component_did_update_util'

export default class {
  constructor () {
    const FIRST_RENDER = () => true

    this._readyWhen = FIRST_RENDER
    this._component
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
      actionFunction()
    })
  }

  _setUpListener (resolve, reject) {
    listenOnComponentDidUpdate(this._component, () => {
      try {
        if (this._isDebugModeOn) {
          printLog(this._component)
        }

        if (this._readyWhen()) {
          resolve()
        }
      } catch (err) {
        reject(err)
      }
    })
  }
}

function printLog (component) {
  const propsKeys = Object.keys(component.props)
  const functionPropsName = propsKeys.filter((key) => typeof component.props[key] === 'function')

  console.info('State:\n', JSON.stringify(component.state, null, '    '))
  console.info('Props:\n', JSON.stringify(component.props, null, '    '))
  console.info('Function props:\n', functionPropsName)
  console.info('\n\n')
}

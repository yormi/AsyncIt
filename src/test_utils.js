'use strict'

import assert from 'assert'
import {
  findRenderedComponentWithType,
  scryRenderedComponentsWithType,
  isCompositeComponent,
  renderIntoDocument
} from 'react-addons-test-utils'
import unexpected from 'unexpected'
import unexpectedReact from 'unexpected-react'

let renderedApp

export function renderApp (rootComponent) {
  renderedApp = renderIntoDocument(rootComponent)
  return renderedApp
}

const expect = unexpected.clone().use(unexpectedReact)

export const when = {
  NOW: 'now',
  FIRST_RENDER: () => true
}

export function Test (done) {
  this._done = done
  this._when = when.NOW
  this._componentOrGetter
  this._isDebugModeOn = false
  this._hookedOn

  this.when = function (when) {
    this._when = when
    return this
  }

  this.component = function (componentOrGetter) {
    this._componentOrGetter = componentOrGetter
    return this
  }

  this.trigger = function (trigger) {
    if (typeof trigger === 'function') {
      trigger()
    } else {
      done(new Error('The provided trigger is not a function'))
    }
    return this
  }

  this.debug = function () {
    this._isDebugModeOn = true
    return this
  }

  this.hookedOn = function (component) {
    this._hookedOn = component
    return this
  }

  this.expectToRender = function (expectation) {
    const test = async function () {
      await expect(this._getComponent(), 'to contain', expectation)
    }
    this._setUpTest(test)
    return this
  }

  this.expectNotToRenderComponentType = function (componentType) {
    const test = () => {
      const componentsOfType = scryRenderedComponentsWithType(this._getComponent(), componentType)
      if (componentsOfType.length > 0) {
        throw new Error('No component of type: ' + componentType + 'should be found')
      }
    }
    this._setUpTest(test)
    return this
  }

  this.expectRenderedRef = function (ref) {
    const test = () => assert.ok(this._getComponent().refs[ref], `The ref "${ref}" was not found`)
    this._setUpTest(test)
    return this
  }

  this.expectNoRef = function (ref) {
    const test = () => assert.ok(!this._getComponent().refs[ref], `The ref "${ref}" was found`)
    this._setUpTest(test)
    return this
  }

  this.customTest = function (test) {
    this._setUpTest(test)
    return this
  }

  this._getComponent = function () {
    let component

    if (typeof this._componentOrGetter === 'function') {
      component = this._componentOrGetter()
      if (!isCompositeComponent(component)) {
        throw new Error('The provided getter does not return a valid React Element.')
      }
    } else {
      component = this._componentOrGetter
      if (!isCompositeComponent(component)) {
        throw new Error('The provided component is not a valid React Element.')
      }
    }

    return component
  }

  this._setUpTest = async function (test) {
    const boundTest = test.bind(this)

    if (this._when === when.NOW) {
      try {
        await test()
      } catch (err) {
        console.error(err)
      }
      this._done()
      return
    }

    const wrappedTest = this._wrapForAsyncTest(boundTest, this._when, this._done, this._isDebugModeOn)
    this._hookOnComponentDidUpdate(wrappedTest)
  }

  this._wrapForAsyncTest = function (test) {
    const {
      _done,
      _isDebugModeOn,
      _when
    } = this

    const relevantComponent = this._hookedOn || this._componentOrGetter

    return async function () {
      try {
        if (_isDebugModeOn) {
          printLog(relevantComponent)
        }
        if (_when()) {
          await test()
          _done()
        }
      } catch (err) {
        _done(err)
      }
    }
  }

  this._hookOnComponentDidUpdate = function (test) {
    if (this._hookedOn) {
      this._hookedOn.componentDidUpdate = test
    } else {
      if (this._componentOrGetter === 'function') {
        throw new Error('If no hooked on component is provided, the given component can not be a getter')
      }
      this._componentOrGetter.componentDidUpdate = test
    }
  }
}

function printLog (component) {
  const propsKeys = Object.keys(component.props)
  const functionPropsName = propsKeys.filter((key) => typeof component.props[key] === 'function')

  console.info('Props:\n', JSON.stringify(component.props, null, '    '))
  console.info('Function props:\n', functionPropsName)
  console.info('\n\n')
}

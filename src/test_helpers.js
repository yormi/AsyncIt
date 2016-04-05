'use strict'

import assert from 'assert'
import unexpected from 'unexpected'
import unexpectedReact from 'unexpected-react'
import {
  scryRenderedComponentsWithType
} from 'react-addons-test-utils'

import {
  getRenderedApp
} from '~/src/mount_app'

const expect = unexpected.clone().use(unexpectedReact)

expect.noComponentWithType = function (componentType) {
  const test = () => {
    const componentsOfType = scryRenderedComponentsWithType(getRenderedApp(), componentType)
    if (componentsOfType.length > 0) {
      throw new Error('No component of type: ' + componentType + 'should be found')
    }
  }
  this._setUpTest(test)
  return this
}

expect.renderedRef = function (ref) {
  const test = () => assert.ok(getRenderedApp().refs[ref], `The ref "${ref}" was not found`)
  this._setUpTest(test)
  return this
}

expect.noRef = function (ref) {
  const test = () => assert.ok(!getRenderedApp().refs[ref], `The ref "${ref}" was found`)
  this._setUpTest(test)
  return this
}

export default expect

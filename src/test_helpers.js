'use strict'

import assert from 'assert'
import unexpected from 'unexpected'
import unexpectedReact from 'unexpected-react'
import {
  scryRenderedComponentsWithType
} from 'react-addons-test-utils'

const expect = unexpected.clone().use(unexpectedReact)

expect.notToRenderComponentType = function (componentType) {
  const test = () => {
    const componentsOfType = scryRenderedComponentsWithType(this._getComponent(), componentType)
    if (componentsOfType.length > 0) {
      throw new Error('No component of type: ' + componentType + 'should be found')
    }
  }
  this._setUpTest(test)
  return this
}

expect.renderedRef = function (ref) {
  const test = () => assert.ok(this._getComponent().refs[ref], `The ref "${ref}" was not found`)
  this._setUpTest(test)
  return this
}

expect.noRef = function (ref) {
  const test = () => assert.ok(!this._getComponent().refs[ref], `The ref "${ref}" was found`)
  this._setUpTest(test)
  return this
}

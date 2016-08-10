'use strict'

/* global describe, it */

import assert from 'assert'
import sinon from 'sinon'

import {
  _decorateTest
} from '~/src/async_it'

describe('Async it', () => {
  describe('function passed to mocha\'s it', () => {
    const someError = new Error('hehehe')

    it('catches synchronous error in the test', async () => {
      const test = sinon.stub().throws(someError)
      try {
        await _decorateTest(test)()
      } catch (err) {
        assert.strictEqual(err, someError)
        return
      }

      assert.fail()
    })

    it('catches error in an async call in the provided async test', async () => {
      const test = async () => {
        await simulateAsyncCall(() => { throw someError })
      }

      try {
        await _decorateTest(test)()
      } catch (err) {
        assert.strictEqual(err, someError)
        return
      }

      assert.fail()
    })
  })
})

const simulateAsyncCall = async (fn) => {
  return new Promise((resolve, reject) => {
    const decoratedFunction = () => {
      try {
        fn()
        resolve()
      } catch (err) {
        reject(err)
      }
    }
    setTimeout(decoratedFunction, 10)
  })
}

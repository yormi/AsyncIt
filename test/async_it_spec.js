'use strict'

/* global describe, it */

import assert from 'assert'
import sinon from 'sinon'

import actionLogger from '~/src/action_logger'
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

    it('starts logging when the config "debug" is provided', async () => {
      let wasLoggingSet = false

      const test = () => {
        wasLoggingSet = actionLogger.shouldLogActions()
      }

      await _decorateTest(test, 'debug')()

      assert(wasLoggingSet)
    })

    it('stops test-only logging after a test', async () => {
      const test = () => null
      await _decorateTest(test, null)()
      assert.strictEqual(actionLogger.shouldLogActions(), false)
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

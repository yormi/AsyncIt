'use strict'

/* global describe, beforeEach, it */

import assert from 'assert'
import sinon from 'sinon'

import {
  _decorateTest
} from '~/src/async_it'

describe('Async it', () => {
  describe('function passed to mocha\'s it', () => {
    const someError = new Error('hehehe')
    const done = sinon.spy()

    beforeEach(() => {
      done.reset()
    })

    it('catches synchronous error in the test and pass it to done', async () => {
      const test = sinon.stub().throws(someError)
      await _decorateTest(test)(done)
      assert(done.calledOnce, 'done was not called once but:' + done.callCount)
      assert(done.calledWith(someError), 'done was not called with the error')
    })

    it('catches error in an async call in the provided async test and pass it to done', async () => {
      const test = async (done) => {
        await simulateAsyncCall(() => { throw someError })
      }

      await _decorateTest(test)(done)

      assert(done.calledOnce, 'done was not called once but:' + done.callCount)
      assert(done.calledWith(someError), 'done was not called with the error')
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

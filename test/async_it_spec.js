'use strict'

/* global describe, beforeEach, it */

import assert from 'assert'
import sinon from 'sinon'

import React from 'react'

import {
  _cleanDom,
  _decorateTest,
  renderApp
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

  describe('cleanDom', () => {
    it('does not throw anything if the app has not been rendered... even without fake dom', () => {
      _cleanDom()
    })

    describe('renderApp', () => {
      it('mounts the app', () => {
        let isMounted = false

        class App extends React.Component {
          componentDidMount () {
            isMounted = true
          }

          render () {
            return <h1>This is my fantastic App !</h1>
          }
        }
        require('../src/setup/setup_fake_dom')
        renderApp(App)

        _cleanDom()

        assert(isMounted)
      })
    })

    it('remove the app/root component of the fake dom', () => {
      let isMounted = false

      class App extends React.Component {
        componentDidMount () {
          isMounted = true
        }

        componentWillUnmount () {
          isMounted = false
        }

        render () {
          return <h1>This is my fantastic App !</h1>
        }
      }
      require('../src/setup/setup_fake_dom')
      renderApp(App)

      _cleanDom()

      assert.strictEqual(isMounted, false)
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

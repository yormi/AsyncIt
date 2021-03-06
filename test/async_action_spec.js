/* global describe, it */

import assert from 'assert'
import sinon from 'sinon'
import {
findRenderedDOMComponentWithTag
} from 'react-addons-test-utils'
import React from 'react'

import { asyncIt } from '~/src/async_it'
import AsyncAction, { InvariantError } from '~/src/async_action'
import { mountApp } from '~/src/mount_app'

describe('Async Action', () => {
  require('./async_action/wait_route')
  require('./async_action/wait_props')
  require('./async_action/wait_state')
  require('./async_action/catch_exception')

  asyncIt('if no trigger is provided, the check is done right away and after every subsequent render', async () => {
    class Test extends React.Component {
      constructor () {
        super()
        this.state = { counter: 0 }
        this.someAction = this.someAction.bind(this)
      }

      someAction () {
        this.setState({ counter: this.state.counter + 1 })
      }

      render () {
        return <h1>{this.state.counter}</h1>
      }
    }

    const aRenderedComponent = mountApp(Test)
    aRenderedComponent.someAction()

    const numberOfIncrease = 1
    await new AsyncAction()
    .listenOn(aRenderedComponent)
    .waitState((state) => state.counter === numberOfIncrease)

    assert.deepStrictEqual(aRenderedComponent.state.counter, numberOfIncrease)
  })

  asyncIt('can have many asyncAction in a test', async () => {
    class Test extends React.Component {
      constructor () {
        super()
        this.state = { counter: 0 }
        this.someAction = this.someAction.bind(this)
      }

      someAction () {
        setTimeout(() => this.setState({ counter: this.state.counter + 1 }, 0))
      }

      render () {
        return <h1>{this.state.counter}</h1>
      }
    }

    const aRenderedComponent = mountApp(Test)

    await new AsyncAction()
    .listenOn(aRenderedComponent)
    .trigger(aRenderedComponent.someAction)
    .waitState((state) => state.counter === 1)

    const numberOfIncrease = 2
    await new AsyncAction()
    .listenOn(aRenderedComponent)
    .trigger(aRenderedComponent.someAction)
    .waitState((state) => state.counter === numberOfIncrease)

    assert.deepStrictEqual(aRenderedComponent.state.counter, numberOfIncrease)
  })

  describe('debug', () => {
    class Test extends React.Component {
      render () {
        return <h1>foo</h1>
      }
    }

    it('calls the given debug function with component as param', () => {
      const aRenderedComponent = mountApp(Test)

      const spy = sinon.spy()
      new AsyncAction()
      .debug(spy)
      .listenOn(aRenderedComponent)
      .waitProps((props) => true)

      assert.strictEqual(spy.callCount, 1)
      assert(spy.withArgs(aRenderedComponent))
    })
  })

  describe('invariants', () => {
    class Test extends React.Component {
      render () {
        return <h1>foo</h1>
      }
    }

    asyncIt('throws if the provided component is not a React composite element', async () => {
      const app = mountApp(Test)
      const h1 = findRenderedDOMComponentWithTag(app, 'h1')

      const test = async () => {
        await new AsyncAction()
        .listenOn(h1)
        .waitProps(() => true)
      }

      try {
        await test()
      } catch (err) {
        assert(err instanceof InvariantError, 'Not the right error')
        return
      }

      assert.fail('No errors were thrown')
    })
  })
})

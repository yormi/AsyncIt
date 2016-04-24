/* global describe */

import assert from 'assert'
import React from 'react'

import { asyncIt } from '~/src/async_it'
import AsyncAction from '~/src/async_action'
import { mountApp } from '~/src/mount_app'

describe('Async Action', () => {
  require('./async_action/wait_route')
  require('./async_action/wait_props')
  require('./async_action/wait_state')
  require('./async_action/catch_exception')

  asyncIt('if no trigger is provided, the check is done right away and after every subsequent render', async (done) => {
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
    done()
  })

  asyncIt('can have many asyncAction in a test', async (done) => {
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
    done()
  })
})

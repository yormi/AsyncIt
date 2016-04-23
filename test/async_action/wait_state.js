/* global describe */

import assert from 'assert'
import React from 'react'

import { asyncIt } from '~/src/async_it'
import AsyncAction from '~/src/async_action'
import { mountApp } from '~/src/mount_app'

describe('waitState', () => {
  asyncIt('resolves on first render of the component listened to when no readyWhen provided', async (done) => {
    const newState = { text: 'Potato' }

    class Test extends React.Component {
      constructor () {
        super()
        this.state = {}
        this.someAction = this.someAction.bind(this)
      }

      someAction () {
        this.setState(newState)
      }

      render () {
        return <h1>{this.state.text}</h1>
      }
    }

    const aRenderedComponent = mountApp(Test)

    await new AsyncAction()
    .listenOn(aRenderedComponent)
    .trigger(aRenderedComponent.someAction)
    .waitState((state) => state.text === newState.text)

    assert.deepStrictEqual(aRenderedComponent.state, newState)
    done()
  })
})

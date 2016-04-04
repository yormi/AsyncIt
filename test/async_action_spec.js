'use strict'

/* global describe */

import assert from 'assert'

import React from 'react'

import '~/src/setup/setup_fake_dom'
import {
  asyncIt,
  renderApp
} from '~/src/async_it'
import AsyncAction from '~/src/async_action'

describe('Async Action', () => {
  asyncIt('resolves on first render of the component listened to by default', async (done) => {
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
        return <h1>{this.state.text || 'Banana'}</h1>
      }
    }

    const aRenderedComponent = renderApp(<Test />)

    await new AsyncAction()
    .listenOn(aRenderedComponent)
    .triggerWith(aRenderedComponent.someAction)

    assert.deepStrictEqual(aRenderedComponent.state, newState)
    done()
  })
})

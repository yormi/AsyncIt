'use strict'

/* global describe */

import assert from 'assert'
import {
  findRenderedComponentWithType
} from 'react-addons-test-utils'

import React from 'react'

import '~/src/setup/setup_fake_dom'
import {
  asyncIt,
  renderApp
} from '~/src/async_it'
import AsyncAction from '~/src/async_action'

describe('Async Action', () => {
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
        return <h1>{this.state.text || 'Banana'}</h1>
      }
    }

    const aRenderedComponent = renderApp(Test)

    await new AsyncAction()
    .listenOn(aRenderedComponent)
    .triggerWith(aRenderedComponent.someAction)

    assert.deepStrictEqual(aRenderedComponent.state, newState)
    done()
  })

  asyncIt('resolves when the readyWhen function return true of the component listened to', async (done) => {
    const newState1 = { text: 'Carot' }
    const newState2 = { text: 'Potato' }

    class Test extends React.Component {
      constructor () {
        super()
        this.state = { text: 'Banana' }
        this.someAction = this.someAction.bind(this)
      }

      someAction () {
        this.setState(newState1)
        setTimeout(() => this.setState(newState2), 10)
      }

      render () {
        return <h1>{this.state.text}</h1>
      }
    }

    const aRenderedComponent = renderApp(Test)

    await new AsyncAction()
    .listenOn(aRenderedComponent)
    .readyWhen(() => aRenderedComponent.state.text === newState2.text)
    .triggerWith(aRenderedComponent.someAction)

    assert.deepStrictEqual(aRenderedComponent.state, newState2)
    done()
  })

  asyncIt('an error in the action function is thrown out of the await block', async (done) => {
    const someError = new Error('some error')
    class Test extends React.Component {
      constructor () {
        super()
        this.someAction = this.someAction.bind(this)
      }

      someAction () {
        throw someError
      }

      render () {
        return <h1>Some weird Component</h1>
      }
    }

    const aRenderedComponent = renderApp(Test)

    try {
      await new AsyncAction()
      .listenOn(aRenderedComponent)
      .triggerWith(aRenderedComponent.someAction)
    } catch (err) {
      assert.equal(err, someError)
      done()
      return
    }

    assert.fail('No errors were caught')
  })

  asyncIt('an error in the render method (or other lifecycle method) is thrown out of the await block', async (done) => {
    const someError = new Error('some error')

    class Test extends React.Component {
      constructor () {
        super()
        this.state = { text: 'Banana' }
        this.someAction = this.someAction.bind(this)
      }

      someAction () {
        this.setState({ text: 'error' })
      }

      render () {
        if (this.state.text === 'error') {
          throw someError
        } else {
          return <h1>{this.state.text}</h1>
        }
      }
    }

    const aRenderedComponent = renderApp(Test)
    const sub = findRenderedComponentWithType(aRenderedComponent, Test)

    try {
      await new AsyncAction()
      .listenOn(sub)
      .triggerWith(sub.someAction)
    } catch (err) {
      assert.equal(err, someError)
      done()
      return
    }

    assert.fail('No errors were caught')
  })

  asyncIt('an error in the render method (or other lifecycle method) of a sub component is thrown out of the await block', async (done) => {
    const someError = new Error('some error')

    class Test extends React.Component {
      constructor () {
        super()
        this.state = { text: 'Banana' }
        this.someAction = this.someAction.bind(this)
      }

      someAction () {
        this.setState({ text: 'error' })
      }

      render () {
        return <SubComponent text={this.state.text} />
      }
    }

    class SubComponent extends React.Component {
      static propTypes = {
        text: React.PropTypes.string.isRequired
      }

      render () {
        const text = this.props.text

        if (text === 'error') {
          throw someError
        } else {
          return <h1>{text}</h1>
        }
      }
    }

    const aRenderedComponent = renderApp(Test)
    const sub = findRenderedComponentWithType(aRenderedComponent, Test)

    try {
      await new AsyncAction()
      .listenOn(sub)
      .triggerWith(sub.someAction)
    } catch (err) {
      assert.equal(err, someError)
      done()
      return
    }

    assert.fail('No errors were caught')
  })
})

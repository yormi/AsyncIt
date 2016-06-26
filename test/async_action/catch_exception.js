/* global describe */

import assert from 'assert'
import {
  findRenderedComponentWithType
} from 'react-addons-test-utils'

import React from 'react'

import { asyncIt } from '~/src/async_it'
import AsyncAction from '~/src/async_action'
import { mountApp } from '~/src/mount_app'

describe('Error catching', () => {
  const NEW_STATE1 = { text: 'Carot' }
  const NEW_STATE2 = { text: 'Potato' }
  const AN_ERROR = new Error('blahblabla')

  asyncIt('throws the error thrown within an async render out of the await block', async () => {
    class Test extends React.Component {
      constructor () {
        super()
        this.state = { text: 'Banana' }
        this.someAction = this.someAction.bind(this)
      }

      someAction () {
        this.setState(NEW_STATE1)
        setTimeout(() => this.setState(NEW_STATE2), 10)
      }

      render () {
        if (this.state.text === NEW_STATE2.text) {
          throw AN_ERROR
        }
        return <h1>{this.state.text}</h1>
      }
    }

    const aRenderedComponent = mountApp(Test)

    try {
      await new AsyncAction()
        .listenOn(aRenderedComponent)
        .trigger(aRenderedComponent.someAction)
        .waitState((state) => state.text === NEW_STATE2.text)
    } catch (err) {
      assert.equal(err, AN_ERROR)
      return
    }

    assert.fail('No error were thrown')
  })

  asyncIt('throws the error in the action function out of the await block', async () => {
    class Test extends React.Component {
      constructor () {
        super()
        this.someAction = this.someAction.bind(this)
      }

      someAction () {
        throw AN_ERROR
      }

      render () {
        return <h1>Some weird Component</h1>
      }
    }

    const aRenderedComponent = mountApp(Test)

    try {
      await new AsyncAction()
        .listenOn(aRenderedComponent)
        .trigger(aRenderedComponent.someAction)
        .waitProps(() => true)
    } catch (err) {
      assert.equal(err, AN_ERROR)
      return
    }

    assert.fail('No errors were caught')
  })

  asyncIt('throws the error thrown in the render method (or other lifecycle method) out of the await block', async () => {
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
          throw AN_ERROR
        } else {
          return <h1>{this.state.text}</h1>
        }
      }
    }

    const aRenderedComponent = mountApp(Test)
    const sub = findRenderedComponentWithType(aRenderedComponent, Test)

    try {
      await new AsyncAction()
        .listenOn(sub)
        .trigger(sub.someAction)
        .waitProps(() => true)
    } catch (err) {
      assert.equal(err, AN_ERROR)
      return
    }

    assert.fail('No errors were caught')
  })

  asyncIt('throws the error thrown in the render method (or other lifecycle method) of a sub component out of the await block', async () => {
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
          throw AN_ERROR
        } else {
          return <h1>{text}</h1>
        }
      }
    }

    const aRenderedComponent = mountApp(Test)
    const sub = findRenderedComponentWithType(aRenderedComponent, Test)

    try {
      await new AsyncAction()
        .listenOn(sub)
        .trigger(sub.someAction)
        .waitProps(() => true)
    } catch (err) {
      assert.equal(err, AN_ERROR)
      return
    }

    assert.fail('No errors were caught')
  })

  describe('Errors thrown within AsyncAction methods callback', () => {
    class Test extends React.Component {
      render () {
        return <h1>Yo</h1>
      }
    }

    asyncIt('throws outside the AsyncAction an error thrown in the trigger method', async () => {
      const aRenderedComponent = mountApp(Test)

      try {
        await new AsyncAction()
          .listenOn(aRenderedComponent)
          .trigger(() => { throw AN_ERROR })
          .waitProps(() => true)
      } catch (err) {
        assert.equal(err, AN_ERROR)
        return
      }

      assert.fail('No errors were caught')
    })

    asyncIt('throws outside the AsyncAction an error thrown in the testFunction pass to the waitX method', async () => {
      const aRenderedComponent = mountApp(Test)

      try {
        await new AsyncAction()
          .listenOn(aRenderedComponent)
          .waitProps(() => { throw AN_ERROR })
      } catch (err) {
        assert.equal(err, AN_ERROR)
        return
      }

      assert.fail('No errors were caught')
    })

    asyncIt('throws outside the AsyncAction an error thrown in an async trigger method', async () => {
      const aRenderedComponent = mountApp(Test)

      try {
        await new AsyncAction()
          .listenOn(aRenderedComponent)
          .trigger(async () => Promise.reject(AN_ERROR))
          .waitProps(() => true)
      } catch (err) {
        assert.equal(err, AN_ERROR)
        return
      }

      assert.fail('No errors were caught')
    })
  })
})

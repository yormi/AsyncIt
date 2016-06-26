/* global describe */

import assert from 'assert'
import React from 'react'
import { findRenderedComponentWithType } from 'react-addons-test-utils'

import { asyncIt } from '~/src/async_it'
import AsyncAction from '~/src/async_action'
import { mountApp } from '~/src/mount_app'

describe('wait for props', () => {
  const NEW_STATE1 = { text: 'Carot' }
  const NEW_STATE2 = { text: 'Potato' }
  const AN_ERROR = new Error('blahblabla')

  class SubTest extends React.Component {
    static propTypes = {
      children: React.PropTypes.string
    }

    render () {
      return <h1>{this.props.children}</h1>
    }
  }

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
      return <SubTest>{this.state.text}</SubTest>
    }
  }

  const aRenderedComponent = mountApp(Test)

  const subTest = findRenderedComponentWithType(aRenderedComponent, SubTest)

  asyncIt('resolves when the test provided to waitProps pass', async () => {
    await new AsyncAction()
      .listenOn(subTest)
      .trigger(aRenderedComponent.someAction)
      .waitProps((props) => props.children === NEW_STATE2.text)

    assert.deepStrictEqual(subTest.props.children, NEW_STATE2.text)
  })

  asyncIt('logs the error when it occurs asynchronously in the function provided to waitProps', async () => {
    try {
      await new AsyncAction()
        .listenOn(subTest)
        .trigger(aRenderedComponent.someAction)
        .waitProps((props) => { throw AN_ERROR })
    } catch (err) {
      assert.equal(err, AN_ERROR)
      return
    }

    assert.fail('no error')
  })
})

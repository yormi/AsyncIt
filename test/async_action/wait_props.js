/* global describe */

import assert from 'assert'
import React from 'react'
import { findRenderedComponentWithType } from 'react-addons-test-utils'

import { asyncIt } from '~/src/async_it'
import AsyncAction from '~/src/async_action'
import { mountApp } from '~/src/mount_app'

describe('wait for props', () => {
  asyncIt('resolves when the test provided to waitProps pass', async (done) => {
    const newState1 = { text: 'Carot' }
    const newState2 = { text: 'Potato' }

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
        this.setState(newState1)
        setTimeout(() => this.setState(newState2), 10)
      }

      render () {
        return <SubTest>{this.state.text}</SubTest>
      }
    }

    const aRenderedComponent = mountApp(Test)

    const subTest = findRenderedComponentWithType(aRenderedComponent, SubTest)

    await new AsyncAction()
    .listenOn(subTest)
    .trigger(aRenderedComponent.someAction)
    .waitProps((props) => props.children === newState2.text)

    assert.deepStrictEqual(subTest.props.children, newState2.text)
    done()
  })
})

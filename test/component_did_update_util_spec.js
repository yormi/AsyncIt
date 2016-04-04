'use strict'

/* global describe, beforeEach, it */

import assert from 'assert'
import sinon from 'sinon'
import {
  renderIntoDocument
} from 'react-addons-test-utils'

import React from 'react'

import '~/src/setup/setup_fake_dom'
import {
  listenOnComponentDidUpdate,
  restoreComponentDidUpdate
} from '~/src/component_did_update_util'

describe('Component Did Update Utility', () => {
  const oldListener = sinon.spy()
  const addedListener = sinon.spy()

  beforeEach(() => {
    oldListener.reset()
    addedListener.reset()
  })

  class Test extends React.Component {
    componentDidUpdate () {
      oldListener()
    }

    render () {
      return <h1>Chocolate</h1>
    }
  }

  describe('listenOnComponentDidUpdate', () => {
    it('handles no componentDidUpdate definition on the component', () => {
      class Test extends React.Component {
        render () {
          return <h1>Chocolate</h1>
        }
      }
      const component = renderIntoDocument(<Test />)
      listenOnComponentDidUpdate(component, addedListener)
    })

    describe('with a componentDidUpdate definition', () => {
      beforeEach(() => {
        const component = renderIntoDocument(<Test />)
        listenOnComponentDidUpdate(component, addedListener)
        component.componentDidUpdate()
      })

      it('keeps the previous behavior', () => {
        assert(oldListener.calledOnce, 'the previous listener was not called once but: ' + oldListener.callCount)
      })

      it('adds the given behavior', () => {
        assert(addedListener.calledOnce, 'The previous listener was not called once but: ' + addedListener.callCount)
      })
    })

    describe('restoreComponentDidUpdate', () => {
      beforeEach(() => {
        const component = renderIntoDocument(<Test />)
        listenOnComponentDidUpdate(component, addedListener)
        restoreComponentDidUpdate(component)
        component.componentDidUpdate()
      })

      it('keeps the initial behavior', () => {
        assert(oldListener.calledOnce, 'the previous listener was not called once but: ' + oldListener.callCount)
      })

      it('removes the added behavior', () => {
        assert.strictEqual(addedListener.callCount, 0, 'the previous listener was called: ' + addedListener.callCount)
      })
    })
  })
})

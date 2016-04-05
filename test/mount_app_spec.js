'use strict'

/* global describe, it */

import assert from 'assert'
import React from 'react'

import {
  mountApp,
  unmountApp
} from '~/src/mount_app'

describe('unmountApp', () => {
  it('does not throw anything if the app has not been rendered... even without fake dom', () => {
    unmountApp()
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
    mountApp(App)

    unmountApp()

    assert.strictEqual(isMounted, false)
  })
})

describe('mountApp', () => {
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
    mountApp(App)

    unmountApp()

    assert(isMounted)
  })
})

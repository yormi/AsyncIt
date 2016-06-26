'use strict'

/* global describe, it */

import assert from 'assert'
import React from 'react'
import { Router, Route, createMemoryHistory } from 'react-router'

import {
  getRouterComponent,
  mountApp,
  unmountApp
} from '~/src/mount_app'

describe('getRouterComponent', () => {
  const Title = () => <h1>Yo</h1>
  const route = <Route path='/' component={Title} />
  const routerComponent = (
    <Router routes={route} history={createMemoryHistory()} />
  )

  it('returns the router component if there is one', () => {
    class Test extends React.Component {
      render () {
        return routerComponent
      }
    }
    mountApp(Test)

    assert.ok(getRouterComponent, 'the router is not returned')
  })

  it('throws and error if none is found', () => {
    class Test extends React.Component {
      render () {
        return (
          <div>
            {routerComponent}
            {routerComponent}
          </div>
        )
      }
    }
    mountApp(Test)

    assert.throws(getRouterComponent)
  })
})

describe('unmountApp', () => {
  it('does not throw anything if the app has not been rendered... even without fake dom', () => {
    unmountApp()
  })

  it('unmount the app/root component of the fake dom', () => {
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
  it('mounts the app into the fake dom', () => {
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

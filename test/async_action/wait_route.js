/* global describe */

import React from 'react'
import { Router, Route, createMemoryHistory } from 'react-router'

import expect from '~/src/setup/setup'
import { asyncIt } from '~/src/async_it'
import AsyncAction from '~/src/async_action'
import { mountApp, getRouterComponent } from '~/src/mount_app'

describe('waitRoute', () => {
  const history = createMemoryHistory()
  class Test extends React.Component {
    render () {
      const routes = (
        <Route>
          <Route path='/' component={() => <h1>Failure</h1>} />
          <Route path='foo' component={() => <h1>Success</h1>} />
          <Route path='baz' component={() => <h1>Failure</h1>} />
        </Route>
      )

      return <Router routes={routes} history={history} />
    }
  }

  asyncIt('resolve when router location is the same than the target route path', async () => {
    const app = mountApp(Test)
    await changeRoute(app, '/foo')
    expect(app, 'to contain', <h1>Success</h1>)
  })

  asyncIt('resolve when the given function returns true', async () => {
    const app = mountApp(Test)
    const aRoute = '/foo'
    await changeRoute(app, aRoute, (route) => route === aRoute)
    expect(app, 'to contain', <h1>Success</h1>)
  })

  asyncIt('can have more than one waitRoute in a test', async () => {
    const app = mountApp(Test)

    await changeRoute(app, '/baz')
    await changeRoute(app, '/baz')
    await changeRoute(app, '/foo')

    expect(app, 'to contain', <h1>Success</h1>)
  })

  const changeRoute = async (app, newRoute, testFunction) => {
    const asyncRouteChange = () => {
      setTimeout(() => getRouterComponent().router.push(newRoute), 0)
    }

    await new AsyncAction()
    .trigger(asyncRouteChange)
    .waitRoute(testFunction || newRoute)
  }
})

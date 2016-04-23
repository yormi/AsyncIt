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

  asyncIt('resolve when router location is the same than the target route path', async (done) => {
    const app = mountApp(Test)
    await changeRoute(app, '/foo')
    expect(app, 'to contain', <h1>Success</h1>)
    done()
  })

  asyncIt('can have more than one waitRoute in a test', async (done) => {
    const app = mountApp(Test)

    await changeRoute(app, '/baz')
    await changeRoute(app, '/baz')
    await changeRoute(app, '/foo')

    expect(app, 'to contain', <h1>Success</h1>)

    done()
  })

  const changeRoute = async (app, newRoute) => {
    const asyncRouteChange = () => {
      setTimeout(() => getRouterComponent().router.push(newRoute), 0)
    }

    await new AsyncAction()
    .trigger(asyncRouteChange)
    .waitRoute(newRoute)
  }
})
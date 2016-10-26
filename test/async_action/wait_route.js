/* global describe */

import React from 'react'
import {
  findRenderedComponentWithType,
  Simulate
} from 'react-addons-test-utils'
import { Link, MemoryRouter, Match } from 'react-router'

import expect from '~/src/setup/setup'
import { asyncIt } from '~/src/async_it'
import AsyncAction from '~/src/async_action'
import { mountApp } from '~/src/mount_app'

describe('waitRoute', () => {
  const routes = [ '/', '/foo', '/bar' ]

  class Page extends React.Component {
    render () {
      return (
        <div>
          <h1>{this.props.location.pathname}</h1>
          {routes.map((r) => (
            <Link key={r} to={r}>
              <button ref={r}>{r}</button>
            </Link>
          ))}
        </div>
      )
    }
  }

  class Test extends React.Component {
    render () {
      return (
        <MemoryRouter>
          <Match pattern='/' component={Page} />
        </MemoryRouter>
      )
    }
  }

  asyncIt('resolve when router location is the same than the target route path', async () => {
    const targetRoute = routes[1]
    const app = mountApp(Test)

    await new AsyncAction('Wait for route')
      .trigger(() => {
        const page = findRenderedComponentWithType(app, Page)
        const targetButton = page.refs[targetRoute]
        setTimeout(() => Simulate.click(targetButton, { button: 0 }), 0)
      })
      .waitRoute(targetRoute)

    expect(app, 'to contain', <h1>{targetRoute}</h1>)
  })

  asyncIt('resolve when the given function returns true', async () => {
    const targetRoute = routes[1]
    const app = mountApp(Test)

    await new AsyncAction('Wait for route')
      .trigger(() => {
        const page = findRenderedComponentWithType(app, Page)
        const targetButton = page.refs[targetRoute]
        setTimeout(() => Simulate.click(targetButton, { button: 0 }), 0)
      })
      .waitRoute((route) => route === targetRoute)

    expect(app, 'to contain', <h1>{targetRoute}</h1>)
  })

  asyncIt('can have more than one waitRoute in a test', async () => {
    const routeCrossing = [
      routes[2],
      routes[2],
      routes[1]
    ]
    const app = mountApp(Test)

    const page = findRenderedComponentWithType(app, Page)
    for (let i = 0; i < routeCrossing.length; i++) {
      const route = routeCrossing[i]
      await new AsyncAction('Wait for route ' + i)
        .trigger(() => {
          const targetButton = page.refs[route]
          setTimeout(() => Simulate.click(targetButton, { button: 0 }), 0)
        })
        .waitRoute(route)
    }

    expect(app, 'to contain', <h1>{routeCrossing[routeCrossing.length - 1]}</h1>)
  })
})

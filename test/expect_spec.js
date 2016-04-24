/* global describe, it */

import { renderIntoDocument } from 'react-addons-test-utils'

import React from 'react'

import { expect } from '~/src/index'

describe('batch expect', () => {
  class List extends React.Component {
    render () {
      return (
        <ul>
          <li>foo</li>
          <li>bar</li>
        </ul>
      )
    }
  }

  it('can accept an expectation as JSX', () => {
    const renderedComponent = renderIntoDocument(<List />)
    expect(renderedComponent, 'to contain', <li>foo</li>)
  })

  it('can accept an array of JSX expectations', () => {
    const renderedComponent = renderIntoDocument(<List />)
    expect(renderedComponent, 'to contain', [
      <li>foo</li>,
      <li>bar</li>
    ])
  })
})

'use strict'

/* global it */

import {
  unmountApp
} from '~/src/mount_app'

export const asyncIt = (description, test) => {
  const decoratedTest = _decorateTest(test)
  it(description, decoratedTest)
}

asyncIt.only = (description, test) => {
  const decoratedTest = _decorateTest(test)
  it.only(description, decoratedTest)
}

asyncIt.skip = (description, test) => {
  const decoratedTest = _decorateTest(test)
  it.skip(description, decoratedTest)
}

export const _decorateTest = (test) => {
  return async (done) => {
    const enhancedDone = (err) => {
      unmountApp()
      done(err)
    }

    try {
      await test(enhancedDone)
    } catch (err) {
      enhancedDone(err)
    }
  }
}

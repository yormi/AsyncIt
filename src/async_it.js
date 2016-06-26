'use strict'

/* global it */

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
    try {
      await test()
      done()
    } catch (err) {
      done(err)
    }
  }
}

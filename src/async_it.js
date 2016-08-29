'use strict'

/* global it */

import actionLogger from './action_logger'

export const asyncIt = (description, test, config) => {
  const decoratedTest = _decorateTest(test, config)
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

export const _decorateTest = (test, config) => {
  return async () => {
    if (config === 'debug') {
      actionLogger.startTestOnlyLogging()
    }

    try {
      await test()
      actionLogger.stopTestOnlyLogging()
    } catch (err) {
      actionLogger.stopTestOnlyLogging()
      throw err
    }
  }
}

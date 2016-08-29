let globalLogging = false
let testOnlyLogging = false

const actionLogger = {
  startGlobalLogging: () => { globalLogging = true },
  stopGlobalLogging: () => { globalLogging = false },

  startTestOnlyLogging: () => { testOnlyLogging = true },
  stopTestOnlyLogging: () => { testOnlyLogging = false },

  shouldLogActions: () => {
    return globalLogging || testOnlyLogging
  }
}

export default actionLogger

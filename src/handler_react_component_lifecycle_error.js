'use strict'

import wrapReactLifecycleMethodsWithTryCatch, { config } from 'react-component-errors'

let currentReject

const handleReactLifecycleErrors = (errorReport) => {
  const error = errorReport.error

  if (currentReject) {
    currentReject(error)
    currentReject = null
  } else {
    throw error
  }
}

config.errorHandler = handleReactLifecycleErrors

export const setCurrentReject = (newReject) => { currentReject = newReject }

export const noMoreReject = () => { currentReject = null }

export const wrapLifecycleMethodsWithTryCatch = wrapReactLifecycleMethodsWithTryCatch

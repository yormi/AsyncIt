'use strict'

export const listenOnComponentDidUpdate = (component, func) => {
  const currentListener = component.componentDidUpdate || (() => null)
  const newListener = () => {
    currentListener()
    func()
  }
  newListener.oldListener = currentListener

  component.componentDidUpdate = newListener
}

export const restoreComponentDidUpdate = (component) => {
  const oldListener = component.componentDidUpdate.oldListener
  component.componentDidUpdate = oldListener
}

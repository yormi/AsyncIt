# AsyncIt

My quest to make integration-system-functional test with React easy. Hopefully it'll make sense for
someone !

## Why ?
* Simplify and uniformize tests
* Remove boiler plate
* Improve the feedback loop through logging:
  * Sync errors
  * Errors in `asyncAction`s
  * Errors in React component lifecycle methods
  * `state` and `props` of the relevant component (in debug mode of `asyncAction`s)

# /!\ Construction Zone /!\

## Possible thanks to the great work behind:
* mocha
* unexpected-react
* react-component-errors
* jsdom
* React and its test-utils (dah !)

## API
### `AsyncAction` class
Some sort of builder simplifying async action in our test. Using `triggerWith` instead of the common build.
#### `listenOn(renderedComponent)`
Tell the action which `renderedComponent` to listen to the update. The default is the app mounted
with `mountApp`.

#### `readyWhen(testFunction)`
##### `testFunction` is executed after the update of the component given in listenOn.

#### `triggerWith(actionFunction)`
##### `actionFunction` should trigger a reaction that'll make the `readyWhen` test function pass
eventually. Otherwise, the test will hang within this `AsyncAction`. Use last.

#### `debug()`
`console.log` the `state` and the `props` of the component that is listened to at every test with
`readyWhen`.

### `expect`
It is actually the expect of unexpected-react but the setup is already made for you. See
[unexpected-react doc](https://github.com/bruderstein/unexpected-react).

### `mountApp(RootComponent, props)`
#### `RootComponent` the class on function, not the JSX as with renderIntoDocument
It just keeps a reference of the the app for the DOM cleaning. That simple !
```
export const mountApp = (RootComponent, props) => {
  renderedApp = renderIntoDocument(<RootComponent {...props} />)
  return renderedApp
}
```

### `asyncIt(description, test)`
The only thing that it does is making sure that the fake DOM is cleaned after the test, whether it suceeded or failed. Use it exactly like the `it` in mocha. `asyncIt.only` and `asyncIt.skip` work the same as well.

## Feedbacks... Contributions...
Highly appreciated ! I'm unfortunately not perfect yet.

For pull request,
Just make sure to add tests with your work.
Oh, oh ! Why not `npm run lint` as well :)

## Todo
* Tests for waitOnRoute
* polyfill !?

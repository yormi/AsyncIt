[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

# test-them-all

My quest to make integration-system-functional test with React easy. Hopefully it'll make sense for someone !

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

  - [Why ?](#why-)
  - [How to install ?](#how-to-install-)
  - [How to use this thing ?](#how-to-use-this-thing-)
  - [API](#api)
      - [`actionLogger`](#actionlogger)
      - [`asyncIt (description, test, config)`](#asyncit-description-test-config)
      - [`mountApp (RootComponent, props)`](#mountapp-rootcomponent-props)
        - [`RootComponent`](#rootcomponent)
      - [`AsyncAction` class](#asyncaction-class)
        - [constructor `new AsyncAction(actionDescription)`](#constructor-new-asyncactionactiondescription)
        - [`listenOn (renderedComponent)`](#listenon-renderedcomponent)
        - [`trigger (actionFunction)`](#trigger-actionfunction)
        - [`waitProps (testFunction)`](#waitprops-testfunction)
        - [`waitState (testFunction)`](#waitstate-testfunction)
        - [`waitRoute (targetRoutePath)`](#waitroute-targetroutepath)
        - [`debug (debugFunction)`](#debug-debugfunction)
      - [`expect`](#expect)
  - [Troubleshooting](#troubleshooting)
  - [Feedbacks... Contributions...](#feedbacks-contributions)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Why ?

* Simplify and uniformize tests
* Remove boiler plate
* Improve the feedback loop through logging:
  * Sync errors
  * Errors in `asyncAction`'s
  * Errors in React component lifecycle methods
  * `state` and `props` of the relevant component (in debug mode of `asyncAction`'s)


## How to install ?

```
npm install -D test-them-all
```

Needless to say that you need to have `react` installed. You also need:
* `reat-dom`
* `react-addons-test-utils`
* `react-router` (Optional: only if you want to use [`waitRoute`](#waitroutetargetroutepath))

You will need 3 other things to setup:
* A polyfill
* Import `test-them-all` before anything else
* Set a global `afterEach` to reset the DOM state

### Polyfill

As any user of many ES6+ goodies, a polyfill is needed. I suggest `babel-polyfill` :)

```
npm install -D babel-polyfill
```

I recommend to include the polyfill in the test command. If you code in ES5 and don't any compiler, I would personnally use something like:

```
mocha test/end_to_end/ -r babel-polyfill -r test-them-all --recursive
```

### Why to require it in the mocha call ?

To use `unexpected-react` a special setup with a specific order of require/import is required. This
is done for you but you need to make sure that `react` is not imported before `test-them-all`.

I just find it way less trouble to import it in the test call.

### Resetting the fake DOM state
You just need to have a global `afterEach` hook. To achieve that, you can simply create a file like any other of your test file and add this in it. The file has to be in your test folder and fit the regex you might use to filter the test files so that it will be considered by mocha.

```javascript
/* global afterEach */

import {
  unmountApp
} from 'test-them-all'

afterEach(unmountApp)
```

## How to use this thing ?

```javascript
asyncIt('displays the current count', async () => {
  const renderedComponent = mountApp(Test)

  await new AsyncAction()
    .listenOn(renderedComponent)
    .trigger(renderedComponent.asyncIncrease)
    .waitState((state) => state.count === 1)

  expect(renderedComponent, 'to contain', <p>1</p>)
})
```

If you don't need to test the component in between two change, you can use the action without a trigger. I personally prefer always using the trigger to have the action in one statement/block except when the trigger is the initial render (for async fetch in `componentWillMount` for instance).
```javascript
asyncIt('displays succeeded when the asyncAction is successful', async () => {
  const renderedComponent = mountApp(Test)
  
  await new AsyncAction()
    .listenOn(renderedComponent)
    .waitState((state) => state.name === 'some fetched name')

  expect(renderedComponent, 'to contain', <h1>some fetched name</h1>)
})
```

Used to test this component:
```javascript
/* Nothing special with the component... just here as context for the test... */
class Test extends React.Component {
  constructor () {
   super()
   this.state = {
     actionCount: 0,
     name: 'foo'
   }
   this.increase = this.increase.bind(this)
  }
  
  async componentWillMount () {
    this.state.name = await fetchName() // will return 'some fetched name'
  }

  async asyncIncrease () {
    const count = this.state.count + 1
     try {
       await asyncDarkMagic()
       this.setState({
         count
       })
     } catch (err) {
       // do something else
     }
  }

  render () {
    return (
      <h1>{this.state.name}</h1>
      <p>{this.state.counter}</p>
    )
  }
}
```


## API

#### `actionLogger`

Object with 2 methods. Start and stop. I like it easy, what d'you think !? :)

##### `start`

Starts the action logging globally (until `actionLogger.stop()` is called). Useful mostly for mocha's hooks such as `before`,`beforeEach`, `after` and so on.

##### `stop`

Well, I'm sure you get it ;)

#### `asyncIt (description, test, config)`

The only thing that it does is making sure that the fake DOM is cleaned after the test, whether it succeeded or failed.

Oh ! It also sets the action logging for the test scope when `config === 'debug'`.

Use it exactly like the `it` in [mocha](https://mochajs.org/). `asyncIt.only` and `asyncIt.skip` work the same as well.

***Attention ! Unlike `mocha`, there's no done parameter. You have to whether make sure your test is over when it returns or returns a promise.

#### `mountApp (RootComponent, props)`

##### `RootComponent`

The class or function, not the JSX as with it would be with renderIntoDocument.
It just wraps the lifecycle method of the component and keeps a reference of the the app for the DOM cleaning and to get a hand on the Router.
That simple !

```javascript
export const mountApp = (RootComponent, props) => {
  wrapLifecycleMethodsWithTryCatch(RootComponent) // from react-component-errors
  renderedApp = renderIntoDocument(<RootComponent {...props} />)
  return renderedApp
}
```

#### `AsyncAction` class

Some sort of builder simplifying async action in our test.

##### constructor `new AsyncAction(actionDescription)`
`actionDescription` is gonna be shown when logging the actions for debugging.

##### `listenOn (renderedComponent)`

Tell the action which `renderedComponent` to listen to the updates. This will be ignore if when using `waitRoute`.

Return `this`.

##### `trigger (actionFunction)`

###### `actionFunction`

Should trigger a reaction that'll make the app/component get to th wanted state
eventually. Otherwise, the test will hang within this `AsyncAction`.

Return `this`.

##### `waitProps (testFunction)`

###### `testFunction (props)`

The `AsyncAction` is checking after every render of the component provided with `listenOn` if `testFunction` returns true to resolve.

The `props` of the component provided with `listenOn` is passed to `testFunction` as parameter.

##### `waitState (testFunction)`

###### `testFunction (state)`

The `AsyncAction` is checking after every render of the component provided with `listenOn` if `testFunction` returns true to resolve.

The `state` of the component provided with `listenOn` is passed to `testFunction` as parameter.

##### `waitRoute (targetRoutePath)`

To simplify useless overwork, a special method has been added

##### `debug (debugFunction)`

`console.log` the `state` and the `props` of the component that is listened to after every render of the given component in `listenOn`.

In the case of `waitRoute`, only the `pathname` of the current location is logged.

If you want to use a custom function, you can always do it via `debugFunction(component)`. You can access the props with `component.props` and the state with `component.state`.

Return `this`.

#### `expect`

It is almost the same expect of unexpected-react but it allows batch testing. Just pass an array as the last parameter like so:

```javascript
expect(renderedComponent, 'to contain', [
  <li>foo</li>,
  <li>bar</li>
])
```

Moreover, the setup is already made for you. See [unexpected-react](https://github.com/bruderstein/unexpected-react) for more details.

## Troubleshooting

Don't forget to reject the promises if you're using any. Just throwing an error in a promise without rejecting will swallow the error.

The test pass when it should not ? Make sure your test is over when it returns or otherwise you have to return a promise.

## Feedbacks... Contributions...

Highly appreciated ! I'm unfortunately not perfect yet.

For pull requests,
Just make sure to add tests with your work.
Oh, oh ! Why not `npm run lint` as well :)

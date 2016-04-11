# test-them-all

My quest to make integration-system-functional test with React easy. Hopefully it'll make sense for
someone !

- [How to install ?](#how-to-install-)
  - [Polyfill](#how-to-install-)
  - [Why to require it in the mocha call ?](#Why-to-require-it-in-the-mocha-call-)
- [How to use this thing ?](#how-to-use-this-thing-)
- [Why ?](#why-)
- [Featuring](#featuring)
- [API](#api)
  - [`asyncIt`](#asyncitdescription-test)
  - [`mountApp`](#mountapprootcomponent-props)
  - [`AsyncAction`](#asyncaction-class)
    - [`listenOn`](#listenonrenderedcomponent)
    - [`readyWhen`](#readywhentestfunction)
    - [`debug`](#debug)
    - [`triggerWith`](#triggerwithactionfunction)
  - [`expect`](#expect)
- [Jist of the Test Suite](#jist-of-the-test-suite)
- [Troubleshooting](#troubleshooting)
- [Feedbacks... Contributions...](#feedbacks-contributions)
- [Todo](#todo)

## How to install ?

```
npm install -D test-them-all
```

### Polyfill

As any user of many ES6+ goodies, a polyfill is needed. I suggest [`babel-polyfill`] :)

```
npm install -D babel-polyfill
```

I recommend to include the polyfill in the test command. For ES5, without babel compiler, I would personnally use something like:

```
mocha test/end_to_end/ -r babel-polyfill -r test-them-all --recursive
```

### Why to require it in the mocha call ?

To use `unexpected-react` a special setup with a specific order of require/import is required. This
is done for you but you need to make sure that `React` is not imported before `test-them-all`.

I just find way less trouble to import it in the test call.

## How to use this thing ?
```javascript
asyncIt('display succeeded when the asyncAction is successful', async (done) => {
  const aRenderedComponent = mountApp(Test)

  await new AsyncAction()
    .listenOn(aRenderedComponent)
    .triggerWith(aRenderedComponent.someAsyncAction)

  await new AsyncAction()
    .listenOn(aRenderedComponent)
    .triggerWith(aRenderedComponent.someAsyncAction)

  expect(aRenderedComponent, 'to contain', <h1>successful2</h1>)
  done() // don't forget to call done ! That's where the clean up of the fake dom is made
})
```

Used to test this component:
```javascript
/* Nothing special with the component... just here as context to the test... */
class Test extends React.Component {
  constructor () {
   super()
   this.state = {
     text: 'hello world',
     actionCount: 0
   }
   this.someAction = this.someAction.bind(this)
  }

  async someAsyncAction () {
    const actionCount = this.state.actionCount + 1
    try {
      await asyncDarkMagic()
      this.setState({
        text: 'succeeded',
        actionCount
      })
    } catch (err) {
      this.setState({
        text: 'failed',
        actionCount
        })
    }
  }

  render () {
    return <h1>{this.state.text}{this.state.actionCount}</h1>
  }
}
```

## Why ?
* Simplify and uniformize tests
* Remove boiler plate
* Improve the feedback loop through logging:
  * Sync errors
  * Errors in `asyncAction`s
  * Errors in React component lifecycle methods
  * `state` and `props` of the relevant component (in debug mode of `asyncAction`s)

## Featuring:
* mocha
* unexpected-react
* react-component-errors
* jsdom
* React and its test-utils (dah !)

## API

#### `asyncIt(description, test)`
The only thing that it does is making sure that the fake DOM is cleaned after the test, whether it suceeded or failed. Use it exactly like the `it` in [mocha](https://mochajs.org/). `asyncIt.only` and `asyncIt.skip` work the same as well.

#### `mountApp(RootComponent, props)`
##### `RootComponent`
The class or function, not the JSX as with it would be with renderIntoDocument.
It just wraps the lifecycle method of the component and keeps a reference of the the app for the DOM cleaning.
That simple !

```javascript
export const mountApp = (RootComponent, props) => {
  wrapLifecycleMethodsWithTryCatch(RootComponent) // from react-component-errors
  renderedApp = renderIntoDocument(<RootComponent {...props} />)
  return renderedApp
}
```

#### `AsyncAction` class
Some sort of builder simplifying async action in our test. Using `triggerWith` instead of the common build.
##### `listenOn(renderedComponent)`
Tell the action which `renderedComponent` to listen to the update. The default is the app mounted
with `mountApp`.

##### `readyWhen(testFunction)`
###### `testFunction`
The `AsyncActoin` is checking after every render of the component provided with `listenOn` if the testFunction returns true to resolve.

##### `debug()`
`console.log` the `state` and the `props` of the component that is listened to at every test with
`readyWhen`.

##### `triggerWith(actionFunction)`
###### `actionFunction`
Should trigger a reaction that'll make the `testFunction` provided with `readyWhen` return true
eventually. Otherwise, the test will hang within this `AsyncAction`. Use last. This is the "build of the AsyncAction "builder".

Returns a promise.

#### `expect`
It is actually the expect of unexpected-react but the setup is already made for you. See
[unexpected-react doc](https://github.com/bruderstein/unexpected-react).

## Jist of the test suite
```
  Async Action
    ✓ resolves on first render of the component listened to when no readyWhen provided
    ✓ resolves when the readyWhen function return true of the component listened to
    ✓ throws the error thrown within an async render out of the await block
    ✓ throws the error in the action function out of the await block
    ✓ throws the error thrown in the render method (or other lifecycle method) out of the await block
    ✓ throws the error thrown in the render method (or other lifecycle method) of a sub component out of the await block
    ✓ can have many asyncAction in a test

  Async it
    function passed to mocha's it
      ✓ catches synchronous error in the test and passes it to done
      ✓ catches error in an async call in the provided async test and pass it to done

  mountApp
    ✓ mounts the app into the fake dom
```

## Troubleshooting
Don't forget to reject the promises if you're using any. Just throwing in a promise without rejecting will swallow the error.

## Feedbacks... Contributions...
Highly appreciated ! I'm unfortunately not perfect yet.

For pull request,
Just make sure to add tests with your work.
Oh, oh ! Why not `npm run lint` as well :)

## Todo
* waitOnRoute
* what to do with the polyfill !?

'use strict'

import 'babel-polyfill'

import '~/src/setup_fake_dom'
import unexpected from 'unexpected'
import unexpectedReact from 'unexpected-react'

export default unexpected.clone().use(unexpectedReact)

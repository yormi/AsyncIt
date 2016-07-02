'use strict'

// order important here
import '~/src/setup/setup_fake_dom'
import unexpected from 'unexpected'
import unexpectedReact from 'unexpected-react'

const expect = unexpected.clone().use(unexpectedReact)
export default expect

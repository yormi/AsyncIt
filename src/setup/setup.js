'use strict'

// order important here
import '~/src/setup/setup_fake_dom'
import unexpected from 'unexpected'
import unexpectedReact from 'unexpected-react'

export default unexpected.clone().use(unexpectedReact)

import expect from '~/src/setup/setup'

export default (componentToTest, mode, expected) => {
  if (Array.isArray(expected)) {
    return expected.map(e => expect(componentToTest, mode, e))
  }

  return expect(componentToTest, mode, expected)
}


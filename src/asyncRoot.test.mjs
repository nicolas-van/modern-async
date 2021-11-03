
import { expect, test, beforeEach, afterEach } from '@jest/globals'
import CancelledError from './CancelledError.mjs'
import asyncRoot from './asyncRoot.mjs'
import Deferred from './Deferred.mjs'

const baseErrorFct = console.error

beforeEach(() => {
  console.error = () => {}
})

afterEach(() => {
  console.error = baseErrorFct
})

test('asyncRoot', async () => {
  const d = new Deferred()

  asyncRoot(async () => {
    throw new CancelledError('test')
  }, (e) => {
    d.resolve(e)
  })

  const res = await d.promise
  expect(res).toBeInstanceOf(CancelledError)
})

test('asyncRoot no handler', async () => {
  asyncRoot(async () => {
    throw new CancelledError('test')
  })
})

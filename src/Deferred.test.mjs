
import { expect, test } from '@jest/globals'
import Deferred from './Deferred.mjs'

test('Deferred', async () => {
  const d = new Deferred()
  d.resolve(15)
  expect(await d.promise).toBe(15)
  const d2 = new Deferred()
  d2.reject(new Error('test'))
  try {
    await d2.promise
    expect(true).toBe(false)
  } catch (e) {
    expect(e.message).toBe('test')
  }
})


import { expect, test } from '@jest/globals'
import timeout from './timeout.mjs'
import sleepPrecise from './sleepPrecise.mjs'
import TimeoutError from './TimeoutError.mjs'

test('timeout no timeout', async () => {
  const result = await timeout(async () => {
    await sleepPrecise(10)
    return 'test'
  }, 150)
  expect(result).toBe('test')
})

test('timeout with timeout', async () => {
  try {
    await timeout(async () => {
      await sleepPrecise(150)
    }, 10)
    expect(false).toBe(true)
  } catch (e) {
    expect(e).toBeInstanceOf(TimeoutError)
  }
})


import { expect, test } from '@jest/globals'
import asyncTimeoutPrecise from './asyncTimeoutPrecise.mjs'
import asyncSleepPrecise from './asyncSleepPrecise.mjs'
import TimeoutError from './TimeoutError.mjs'

test('asyncTimeoutPrecise no timeout', async () => {
  const result = await asyncTimeoutPrecise(async () => {
    await asyncSleepPrecise(10)
    return 'test'
  }, 150)
  expect(result).toBe('test')
})

test('asyncTimeoutPrecise with timeout', async () => {
  try {
    await asyncTimeoutPrecise(async () => {
      await asyncSleepPrecise(50)
    }, 10)
    expect(false).toBe(true)
  } catch (e) {
    expect(e).toBeInstanceOf(TimeoutError)
  }
})

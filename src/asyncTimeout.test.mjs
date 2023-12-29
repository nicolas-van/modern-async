
import { expect, test } from '@jest/globals'
import asyncTimeout from './asyncTimeout.mjs'
import asyncSleepPrecise from './asyncSleepPrecise.mjs'
import TimeoutError from './TimeoutError.mjs'

test('asyncTimeout no timeout', async () => {
  const result = await asyncTimeout(async () => {
    await asyncSleepPrecise(10)
    return 'test'
  }, 150)
  expect(result).toBe('test')
})

test('asyncTimeout with timeout', async () => {
  try {
    await asyncTimeout(async () => {
      await asyncSleepPrecise(150)
    }, 10)
    expect(false).toBe(true)
  } catch (e) {
    expect(e).toBeInstanceOf(TimeoutError)
  }
})

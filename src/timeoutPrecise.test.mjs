
import { expect, test } from '@jest/globals'
import timeoutPrecise from './timeoutPrecise'
import sleepPrecise from './sleepPrecise'
import TimeoutError from './TimeoutError'

test('timeoutPrecise no timeout', async () => {
  const result = await timeoutPrecise(async () => {
    await sleepPrecise(10)
    return 'test'
  }, 150)
  expect(result).toBe('test')
})

test('timeoutPrecise with timeout', async () => {
  try {
    await timeoutPrecise(async () => {
      await sleepPrecise(50)
    }, 10)
    expect(false).toBe(true)
  } catch (e) {
    expect(e).toBeInstanceOf(TimeoutError)
  }
})

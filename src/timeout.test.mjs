
import { expect, test } from '@jest/globals'
import timeout from './timeout'
import sleepPrecise from './sleepPrecise'
import TimeoutError from './TimeoutError'

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
      await sleepPrecise(50)
    }, 10)
    expect(false).toBe(true)
  } catch (e) {
    expect(e).toBeInstanceOf(TimeoutError)
  }
})

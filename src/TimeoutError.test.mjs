
import { expect, test } from '@jest/globals'
import TimeoutError from './TimeoutError.mjs'

test('TimeoutError', async () => {
  try {
    throw new TimeoutError('test')
  } catch (e) {
    expect(e.name).toBe('TimeoutError')
    expect(e).toBeInstanceOf(TimeoutError)
    expect(e.message).toBe('test')
  }
})

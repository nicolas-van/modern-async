
import { expect, test } from '@jest/globals'
import CancelledError from './CancelledError.mjs'

test('CancelledError', async () => {
  try {
    throw new CancelledError('test')
  } catch (e) {
    expect(e.name).toBe('CancelledError')
    expect(e).toBeInstanceOf(CancelledError)
    expect(e.message).toBe('test')
  }
})

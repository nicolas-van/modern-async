
import { expect, test } from '@jest/globals'
import immediateCancellable from './immediateCancellable'
import CancelledError from './CancelledError'

test('immediateCancellable', async () => {
  const [p] = immediateCancellable()
  await p
})

test('immediateCancellable cancel', async () => {
  const [p, cancel] = immediateCancellable()
  cancel()
  try {
    await p
    expect(true).toBe(false)
  } catch (e) {
    expect(e).toBeInstanceOf(CancelledError)
  }
})

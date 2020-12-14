
import { expect, test } from '@jest/globals'
import delayCancellable from './delayCancellable.mjs'
import CancelledError from './CancelledError.mjs'

test('delayCancellable', async () => {
  const [p] = delayCancellable()
  await p
})

test('delayCancellable cancel', async () => {
  const [p, cancel] = delayCancellable()
  cancel()
  try {
    await p
    expect(true).toBe(false)
  } catch (e) {
    expect(e).toBeInstanceOf(CancelledError)
  }
})

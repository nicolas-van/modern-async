
import { expect, test } from '@jest/globals'
import asyncDelayCancellable from './asyncDelayCancellable.mjs'
import CancelledError from './CancelledError.mjs'

test('asyncDelayCancellable', async () => {
  const events = []
  const p = asyncDelayCancellable()[0].then(() => {
    events.push('resolved')
  })
  Promise.resolve().then(() => {
    events.push('microtask')
  })

  await p
  expect(events).toStrictEqual(['microtask', 'resolved'])
})

test('asyncDelayCancellable cancel', async () => {
  const [p, cancel] = asyncDelayCancellable()
  const res = cancel()
  expect(res).toBe(true)
  try {
    await p
    expect(true).toBe(false)
  } catch (e) {
    expect(e).toBeInstanceOf(CancelledError)
  }
  const res2 = cancel()
  expect(res2).toBe(false)
})


import { expect, test } from '@jest/globals'
import delayCancellable from './delayCancellable.mjs'
import CancelledError from './CancelledError.mjs'

test('delayCancellable', async () => {
  const events = []
  const p = delayCancellable()[0].then(() => {
    events.push('resolved')
  })
  Promise.resolve().then(() => {
    events.push('microtask')
  })

  await p
  expect(events).toStrictEqual(['microtask', 'resolved'])
})

test('delayCancellable cancel', async () => {
  const [p, cancel] = delayCancellable()
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

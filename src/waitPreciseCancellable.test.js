
import { expect, test } from '@jest/globals'
import waitPreciseCancellable, { _innerWaitPreciseCancellable } from './waitPreciseCancellable'
import CancelledError from './CancelledError'

test('waitPreciseCancellable base', async () => {
  const start = new Date().getTime()
  const [p] = waitPreciseCancellable(100)
  await p
  const end = new Date().getTime()
  expect(end - start).toBeGreaterThanOrEqual(100)
})

test('waitPreciseCancellable cancel', async () => {
  const start = new Date().getTime()
  const [p, cancel] = waitPreciseCancellable(100)
  cancel()
  try {
    await p
    expect(true).toBe(false)
  } catch (e) {
    const end = new Date().getTime()
    expect(end - start).toBeLessThan(50)
    expect(e).toBeInstanceOf(CancelledError)
  }
})

test('waitPreciseCancellable async cancel', async () => {
  const start = new Date().getTime()
  const [p, cancel] = waitPreciseCancellable(100)
  setTimeout(() => {
    cancel()
  }, 10)
  try {
    await p
    expect(true).toBe(false)
  } catch (e) {
    const end = new Date().getTime()
    expect(end - start).toBeLessThan(50)
    expect(e).toBeInstanceOf(CancelledError)
  }
})

test('waitPreciseCancellable too late cancel', async () => {
  const [p, cancel] = waitPreciseCancellable(0)
  await waitPreciseCancellable(50)[0]
  cancel()
  await p
})

test('waitPreciseCancellable retriggers', async () => {
  const start = new Date().getTime()
  let first = false
  let callCount = 0
  const [p] = _innerWaitPreciseCancellable(100, (ellapsed, amount) => {
    callCount += 1
    if (!first) {
      first = true
      return false
    } else {
      return true
    }
  })
  await p
  expect(callCount).toBe(2)
  const end = new Date().getTime()
  expect(end - start).toBeGreaterThanOrEqual(100)
})

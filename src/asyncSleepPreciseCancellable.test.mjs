
import { expect, test } from '@jest/globals'
import asyncSleepPreciseCancellable, { _innerWaitPreciseCancellable } from './asyncSleepPreciseCancellable.mjs'
import CancelledError from './CancelledError.mjs'

test('asyncSleepPreciseCancellable base', async () => {
  const start = new Date().getTime()
  const [p] = asyncSleepPreciseCancellable(100)
  await p
  const end = new Date().getTime()
  expect(end - start).toBeGreaterThanOrEqual(100)
})

test('asyncSleepPreciseCancellable cancel', async () => {
  const start = new Date().getTime()
  const [p, cancel] = asyncSleepPreciseCancellable(100)
  expect(cancel()).toBe(true)
  try {
    await p
    expect(true).toBe(false)
  } catch (e) {
    const end = new Date().getTime()
    expect(end - start).toBeLessThan(50)
    expect(e).toBeInstanceOf(CancelledError)
  }
})

test('asyncSleepPreciseCancellable async cancel', async () => {
  const start = new Date().getTime()
  const [p, cancel] = asyncSleepPreciseCancellable(100)
  setTimeout(() => {
    expect(cancel()).toBe(true)
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

test('asyncSleepPreciseCancellable double cancel', async () => {
  const start = new Date().getTime()
  const [p, cancel] = asyncSleepPreciseCancellable(100)
  expect(cancel()).toBe(true)
  expect(cancel()).toBe(false)
  try {
    await p
    expect(true).toBe(false)
  } catch (e) {
    const end = new Date().getTime()
    expect(end - start).toBeLessThan(50)
    expect(e).toBeInstanceOf(CancelledError)
  }
})

test('asyncSleepPreciseCancellable too late cancel', async () => {
  const [p, cancel] = asyncSleepPreciseCancellable(0)
  await asyncSleepPreciseCancellable(50)[0]
  expect(cancel()).toBe(false)
  await p
})

test('asyncSleepPreciseCancellable retriggers', async () => {
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

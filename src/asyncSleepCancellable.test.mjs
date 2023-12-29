
import { expect, test } from '@jest/globals'
import asyncSleepCancellable from './asyncSleepCancellable.mjs'
import CancelledError from './CancelledError.mjs'

test('asyncSleepCancellable base', async () => {
  const start = new Date().getTime()
  const [p] = asyncSleepCancellable(100)
  await p
  const end = new Date().getTime()
  expect(end - start).toBeGreaterThanOrEqual(50)
})

test('asyncSleepCancellable cancel', async () => {
  const [p, cancel] = asyncSleepCancellable(100)
  expect(cancel()).toBe(true)
  try {
    await p
    expect(true).toBe(false)
  } catch (e) {
    expect(e).toBeInstanceOf(CancelledError)
  }
})

test('asyncSleepCancellable double cancel', async () => {
  const start = new Date().getTime()
  const [p, cancel] = asyncSleepCancellable(100)
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

test('asyncSleepCancellable too late cancel', async () => {
  const [p, cancel] = asyncSleepCancellable(0)
  await asyncSleepCancellable(50)[0]
  expect(cancel()).toBe(false)
  await p
})

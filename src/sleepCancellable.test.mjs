
import { expect, test } from '@jest/globals'
import sleepCancellable from './sleepCancellable.mjs'
import CancelledError from './CancelledError.mjs'

test('sleepCancellable base', async () => {
  const start = new Date().getTime()
  const [p] = sleepCancellable(100)
  await p
  const end = new Date().getTime()
  expect(end - start).toBeGreaterThanOrEqual(50)
})

test('sleepCancellable cancel', async () => {
  const start = new Date().getTime()
  const [p, cancel] = sleepCancellable(100)
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

test('sleepCancellable async cancel', async () => {
  const start = new Date().getTime()
  const [p, cancel] = sleepCancellable(100)
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

test('sleepCancellable double cancel', async () => {
  const start = new Date().getTime()
  const [p, cancel] = sleepCancellable(100)
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

test('sleepCancellable too late cancel', async () => {
  const [p, cancel] = sleepCancellable(0)
  await sleepCancellable(50)[0]
  expect(cancel()).toBe(false)
  await p
})

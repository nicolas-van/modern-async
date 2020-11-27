
import { expect, test } from '@jest/globals'
import waitCancellable from './waitCancellable'
import CancelledError from './CancelledError'

test('waitCancellable base', async () => {
  const start = new Date().getTime()
  const [p] = waitCancellable(100)
  await p
  const end = new Date().getTime()
  expect(end - start).toBeGreaterThanOrEqual(50)
})

test('waitCancellable cancel', async () => {
  const start = new Date().getTime()
  const [p, cancel] = waitCancellable(100)
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

test('waitCancellable async cancel', async () => {
  const start = new Date().getTime()
  const [p, cancel] = waitCancellable(100)
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

test('waitCancellable double cancel', async () => {
  const start = new Date().getTime()
  const [p, cancel] = waitCancellable(100)
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

test('waitCancellable too late cancel', async () => {
  const [p, cancel] = waitCancellable(0)
  await waitCancellable(50)[0]
  expect(cancel()).toBe(false)
  await p
})

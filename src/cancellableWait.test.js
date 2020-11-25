
import { expect, test } from '@jest/globals'
import cancellableWait from './cancellableWait'
import CancelledError from './CancelledError'

test('cancellableWait base', async () => {
  const start = new Date().getTime()
  const [p] = cancellableWait(100)
  await p
  const end = new Date().getTime()
  expect(end - start).toBeGreaterThanOrEqual(100)
})

test('cancellableWait cancel', async () => {
  const [p, cancel] = cancellableWait(100)
  cancel()
  try {
    await p
    expect(true).toBe(false)
  } catch (e) {
    expect(e).toBeInstanceOf(CancelledError)
  }
})

test('cancellableWait async cancel', async () => {
  const [p, cancel] = cancellableWait(100)
  setTimeout(() => {
    cancel()
  }, 10)
  try {
    await p
    expect(true).toBe(false)
  } catch (e) {
    expect(e).toBeInstanceOf(CancelledError)
  }
})

test('cancellableWait too late cancel', async () => {
  const [p, cancel] = cancellableWait(0)
  await cancellableWait(10)[0]
  cancel()
  await p
})

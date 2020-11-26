
import { expect, test } from '@jest/globals'
import cancellablePreciseWait from './cancellablePreciseWait'
import CancelledError from './CancelledError'

test('cancellablePreciseWait base', async () => {
  const start = new Date().getTime()
  const [p] = cancellablePreciseWait(100)
  await p
  const end = new Date().getTime()
  expect(end - start).toBeGreaterThanOrEqual(100)
})

test('cancellablePreciseWait cancel', async () => {
  const start = new Date().getTime()
  const [p, cancel] = cancellablePreciseWait(100)
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

test('cancellablePreciseWait async cancel', async () => {
  const start = new Date().getTime()
  const [p, cancel] = cancellablePreciseWait(100)
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

test('cancellablePreciseWait too late cancel', async () => {
  const [p, cancel] = cancellablePreciseWait(0)
  await cancellablePreciseWait(50)[0]
  cancel()
  await p
})

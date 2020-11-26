
import { expect, test } from '@jest/globals'
import cancellablePreciseWait, { _innerCancellablePreciseWait } from './cancellablePreciseWait'
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

test('cancellablePreciseWait retriggers', async () => {
  const start = new Date().getTime()
  let first = false
  let callCount = 0
  const [p] = _innerCancellablePreciseWait(100, (ellasped, amount) => {
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

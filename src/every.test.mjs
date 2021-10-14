
import { expect, test } from '@jest/globals'
import every from './every.mjs'
import Deferred from './Deferred.mjs'
import xrange from './xrange.mjs'

test('every all pass', async () => {
  const callCount = {}
  ;[...xrange(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...xrange(3)].map(() => new Deferred())
  const p = every([...xrange(3)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    return true
  })
  await ds[2].promise
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  d.resolve()
  const res = await p
  expect(res).toBe(true)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
})

test('every no all pass', async () => {
  const callCount = {}
  ;[...xrange(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...xrange(3)].map(() => new Deferred())
  const p = every([...xrange(3)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    if (i === 1) {
      return false
    } else {
      return true
    }
  })
  await ds[2].promise
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  d.resolve()
  const res = await p
  expect(res).toBe(false)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
})

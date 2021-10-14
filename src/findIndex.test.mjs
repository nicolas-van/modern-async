
import { expect, test } from '@jest/globals'
import findIndex from './findIndex.mjs'
import Deferred from './Deferred.mjs'
import xrange from './xrange.mjs'

test('findIndex', async () => {
  const callCount = {}
  ;[...xrange(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...xrange(3)].map(() => new Deferred())
  const p = findIndex([...xrange(3)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    return v === 0
  })
  await ds[2].promise
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  d.resolve()
  const res = await p
  expect(res).toBe(0)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
})

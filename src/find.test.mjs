
import { expect, test } from '@jest/globals'
import find from './find.mjs'
import Deferred from './Deferred.mjs'
import { range } from 'itertools'

test('find', async () => {
  const arr = ['a', 'b', 'c']
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = arr.map(() => new Deferred())
  const p = find(arr, async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    return v === 'b'
  })
  await ds[2].promise
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  d.resolve()
  const res = await p
  expect(res).toBe('b')
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
})

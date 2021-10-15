
import { expect, test } from '@jest/globals'
import findLimit from './findLimit.mjs'
import Deferred from './Deferred.mjs'
import { range } from 'itertools'

test('findLimit', async () => {
  const arr = ['a', 'b', 'c']
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = findLimit(arr, async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    return v === 'b'
  }, 1)
  await ds[0].promise
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
  d.resolve()
  const res = await p
  expect(res).toBe('b')
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(0)
})

test('findLimit not found', async () => {
  const arr = ['a', 'b', 'c']
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const p = findLimit(arr, async (v, i) => {
    callCount[i] += 1
    await d.promise
    return v === 'd'
  }, 1)
  d.resolve()
  const res = await p
  expect(res).toBe(arr.find((v) => v === 'd'))
})

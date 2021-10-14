
import { expect, test } from '@jest/globals'
import someLimit from './someLimit.mjs'
import xrange from './xrange.mjs'
import Deferred from './Deferred.mjs'

test('someLimit compatibility', async () => {
  const p = Promise.resolve()
  let res = await someLimit([...xrange(3)], async (v) => {
    await p
    return true
  }, 1)
  expect(res).toBe([...xrange(3)].some((v) => true))

  res = await someLimit([...xrange(3)], async (v) => {
    await p
    return v !== 2
  }, 1)
  expect(res).toBe([...xrange(3)].some((v) => v !== 2))

  res = await someLimit([...xrange(3)], async (v) => {
    await p
    return false
  }, 1)
  expect(res).toBe([...xrange(3)].some((v) => false))

  res = await someLimit([], async (v) => {
    await p
    return false
  }, 1)
  expect(res).toBe([].some((v) => false))

  res = await someLimit([], async (v) => {
    await p
    return true
  }, 1)
  expect(res).toBe([].some((v) => true))
})

test('someLimit parallel', async () => {
  const p = Promise.resolve()
  let res = await someLimit([...xrange(3)], async (v) => {
    await p
    return true
  }, 10)
  expect(res).toBe([...xrange(3)].some((v) => true))

  res = await someLimit([...xrange(3)], async (v) => {
    await p
    return v !== 2
  }, 10)
  expect(res).toBe([...xrange(3)].some((v) => v !== 2))

  res = await someLimit([...xrange(3)], async (v) => {
    await p
    return false
  }, 10)
  expect(res).toBe([...xrange(3)].some((v) => false))

  res = await someLimit([], async (v) => {
    await p
    return false
  }, 10)
  expect(res).toBe([].some((v) => false))

  res = await someLimit([], async (v) => {
    await p
    return true
  }, 10)
  expect(res).toBe([].some((v) => true))
})

test('someLimit first in time', async () => {
  const ds = [...xrange(3)].map(() => new Deferred())
  const p = someLimit(xrange(3), async (v, i) => {
    await ds[i]
    return true
  }, 3)
  ds[2].resolve()
  const res = await p
  expect(res).toBe(true)
})

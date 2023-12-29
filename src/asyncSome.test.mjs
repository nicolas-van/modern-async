
import { expect, test } from '@jest/globals'
import asyncSome from './asyncSome.mjs'
import { range } from 'itertools'
import Deferred from './Deferred.mjs'

test('asyncSome compatibility', async () => {
  const p = Promise.resolve()
  let res = await asyncSome([...range(3)], async (v) => {
    await p
    return true
  }, 1)
  expect(res).toBe([...range(3)].some((v) => true))

  res = await asyncSome([...range(3)], async (v) => {
    await p
    return v !== 2
  }, 1)
  expect(res).toBe([...range(3)].some((v) => v !== 2))

  res = await asyncSome([...range(3)], async (v) => {
    await p
    return false
  }, 1)
  expect(res).toBe([...range(3)].some((v) => false))

  res = await asyncSome([], async (v) => {
    await p
    return false
  }, 1)
  expect(res).toBe([].some((v) => false))

  res = await asyncSome([], async (v) => {
    await p
    return true
  }, 1)
  expect(res).toBe([].some((v) => true))
})

test('asyncSome parallel', async () => {
  const p = Promise.resolve()
  let res = await asyncSome([...range(3)], async (v) => {
    await p
    return true
  }, 10)
  expect(res).toBe([...range(3)].some((v) => true))

  res = await asyncSome([...range(3)], async (v) => {
    await p
    return v !== 2
  }, 10)
  expect(res).toBe([...range(3)].some((v) => v !== 2))

  res = await asyncSome([...range(3)], async (v) => {
    await p
    return false
  }, 10)
  expect(res).toBe([...range(3)].some((v) => false))

  res = await asyncSome([], async (v) => {
    await p
    return false
  }, 10)
  expect(res).toBe([].some((v) => false))

  res = await asyncSome([], async (v) => {
    await p
    return true
  }, 10)
  expect(res).toBe([].some((v) => true))
})

test('asyncSome first in time', async () => {
  const ds = [...range(3)].map(() => new Deferred())
  const p = asyncSome(range(3), async (v, i) => {
    await ds[i]
    return true
  }, 3)
  ds[2].resolve()
  const res = await p
  expect(res).toBe(true)
})

test('asyncSome infinite concurrency all no pass', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = asyncSome([...range(3)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    return false
  }, Number.POSITIVE_INFINITY)
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

test('asyncSome infinite concurrency some pass', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = asyncSome([...range(3)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    if (i === 1) {
      return true
    } else {
      return false
    }
  }, Number.POSITIVE_INFINITY)
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

test('asyncSome concurrency 1 all no pass', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = asyncSome([...range(3)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    return false
  })
  await ds[0].promise
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
  d.resolve()
  const res = await p
  expect(res).toBe(false)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
})

test('asyncSome concurrency 1 some pass', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = asyncSome([...range(3)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    if (i === 1) {
      return true
    } else {
      return false
    }
  })
  await ds[0].promise
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
  d.resolve()
  const res = await p
  expect(res).toBe(true)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(0)
})

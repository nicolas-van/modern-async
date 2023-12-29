
import { expect, test } from '@jest/globals'
import asyncMap from './asyncMap.mjs'
import Deferred from './Deferred.mjs'
import { range } from 'itertools'

test('asyncMap base', async () => {
  const arr = [...range(6)]
  const res = await asyncMap(arr, async (x) => x * 2, 2)
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
})

test('asyncMap no async', async () => {
  const arr = [...range(6)]
  const res = await asyncMap(arr, (x) => x * 2, 2)
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
})

test('asyncMap concurrency', async () => {
  const arr = [...range(6)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  const d = new Deferred()
  const ds = arr.map(() => new Deferred())
  const p = asyncMap(arr, async (x) => {
    called[x] += 1
    ds[x].resolve()
    await d.promise
    return x * 2
  }, 2)
  await ds[1].promise
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(0)
  expect(called[3]).toBe(0)
  expect(called[4]).toBe(0)
  expect(called[5]).toBe(0)
  d.resolve()
  const res = await p
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

test('asyncMap index & iterable', async () => {
  const arr = [...range(6)]
  const res = await asyncMap(arr, async (x, index, iterable) => {
    expect(index).toBe(x)
    expect(iterable).toBe(arr)
    return x * 2
  }, 2)
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
})

test('asyncMap one exception', async () => {
  const arr = [...range(3)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  try {
    const d = new Deferred()
    const p = asyncMap(arr, async (x) => {
      called[x] += 1
      await d.promise
      if (x === 1) {
        throw new Error('test')
      }
      return x * 2
    }, 1)
    d.resolve()
    await p
    expect(false).toBe(true)
  } catch (e) {
    expect(e.message).toBe('test')
  }
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(0)
})

test('asyncMap all exception c 1', async () => {
  const arr = [...range(3)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  try {
    const d = new Deferred()
    const p = asyncMap(arr, async (x) => {
      called[x] += 1
      await d.promise
      throw new Error('test')
    }, 1)
    d.resolve()
    await p
    expect(false).toBe(true)
  } catch (e) {
    expect(e.message).toBe('test')
  }
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(0)
  expect(called[2]).toBe(0)
})

test('asyncMap all exception c 2', async () => {
  const arr = [...range(3)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  const ds = arr.map(() => new Deferred())
  try {
    const d = new Deferred()
    const p = asyncMap(arr, async (x) => {
      called[x] += 1
      ds[x].resolve()
      await d.promise
      throw new Error('test')
    }, 2)
    await ds[0].promise
    await ds[1].promise
    d.resolve()
    await p
    expect(false).toBe(true)
  } catch (e) {
    expect(e.message).toBe('test')
  }
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(0)
})

test('asyncMap infinite concurrency base', async () => {
  const arr = [...range(6)]
  const res = await asyncMap(arr, async (x) => x * 2, Number.POSITIVE_INFINITY)
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
})

test('asyncMap infinite concurrency no async', async () => {
  const arr = [...range(6)]
  const res = await asyncMap(arr, (x) => x * 2, Number.POSITIVE_INFINITY)
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
})

test('asyncMap infinite concurrency concurrency', async () => {
  const arr = [...range(6)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  const d = new Deferred()
  const ds = arr.map(() => new Deferred())
  const p = asyncMap(arr, async (x) => {
    called[x] += 1
    ds[x].resolve()
    await d.promise
    return x * 2
  }, Number.POSITIVE_INFINITY)
  await ds[5].promise
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
  d.resolve()
  const res = await p
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

test('asyncMap concurrency 1 base', async () => {
  const arr = [...range(6)]
  const res = await asyncMap(arr, async (x) => x * 2)
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
})

test('asyncMap concurrency 1 no async', async () => {
  const arr = [...range(6)]
  const res = await asyncMap(arr, (x) => x * 2)
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
})

test('asyncMap concurrency 1 concurrency', async () => {
  const arr = [...range(6)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  const d = new Deferred()
  const ds = arr.map(() => new Deferred())
  const p = asyncMap(arr, async (x) => {
    ds[x].resolve()
    called[x] += 1
    await d.promise
    return x * 2
  })
  await ds[0].promise
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(0)
  expect(called[2]).toBe(0)
  expect(called[3]).toBe(0)
  expect(called[4]).toBe(0)
  expect(called[5]).toBe(0)
  d.resolve()
  const res = await p
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

import { expect, test } from '@jest/globals'
import asyncFlatMap from './asyncFlatMap.mjs'
import Deferred from './Deferred.mjs'
import Queue from './Queue.mjs'
import { range } from 'itertools'

test('asyncFlatMap base', async () => {
  const arr = [...range(6)]
  const res = await asyncFlatMap(arr, async (x) => [x, x * 2], 2)
  expect(res).toEqual([0, 0, 1, 2, 2, 4, 3, 6, 4, 8, 5, 10])
})

test('asyncFlatMap no async', async () => {
  const arr = [...range(6)]
  const res = await asyncFlatMap(arr, (x) => [x, x * 2], 2)
  expect(res).toEqual([0, 0, 1, 2, 2, 4, 3, 6, 4, 8, 5, 10])
})

test('asyncFlatMap concurrency', async () => {
  const arr = [...range(6)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  const d = new Deferred()
  const ds = arr.map(() => new Deferred())
  const p = asyncFlatMap(arr, async (x) => {
    called[x] += 1
    ds[x].resolve()
    await d.promise
    return [x, x * 2]
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
  expect(res).toEqual([0, 0, 1, 2, 2, 4, 3, 6, 4, 8, 5, 10])
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

test('asyncFlatMap index & iterable', async () => {
  const arr = [...range(6)]
  const res = await asyncFlatMap(arr, async (x, index, iterable) => {
    expect(index).toBe(x)
    expect(iterable).toBe(arr)
    return [x, x * 2]
  }, 2)
  expect(res).toEqual([0, 0, 1, 2, 2, 4, 3, 6, 4, 8, 5, 10])
})

test('asyncFlatMap flattens by one level only', async () => {
  const arr = [1, 2]
  const res = await asyncFlatMap(arr, async (x) => [x, [x * 2], x * 3])
  expect(res).toEqual([1, [2], 3, 2, [4], 6])
})

test('asyncFlatMap keeps values that are not arrays', async () => {
  const res = await asyncFlatMap([1, 2, 3], async (x) => x)
  expect(res).toEqual([1, 2, 3])
})

test('asyncFlatMap behaves like Array.prototype.flatMap', async () => {
  const arr = [1, 2, 3, 4]
  const iteratee = (x) => {
    if (x % 2 === 0) {
      return []
    }
    if (x === 3) {
      return x
    }
    return [x, x * 10]
  }
  expect(await asyncFlatMap(arr, iteratee, 2)).toEqual(arr.flatMap(iteratee))
})

test('asyncFlatMap concurrency 1 base', async () => {
  const arr = [...range(6)]
  const res = await asyncFlatMap(arr, async (x) => [x, x * 2])
  expect(res).toEqual([0, 0, 1, 2, 2, 4, 3, 6, 4, 8, 5, 10])
})

test('asyncFlatMap async iterable', async () => {
  const gen = async function * () {
    for (const x of range(6)) {
      yield x
    }
  }
  const res = await asyncFlatMap(gen(), async (x) => [x, x * 2], 2)
  expect(res).toEqual([0, 0, 1, 2, 2, 4, 3, 6, 4, 8, 5, 10])
})

test('asyncFlatMap queue', async () => {
  const arr = [...range(6)]
  const res = await asyncFlatMap(arr, async (x) => [x, x * 2], new Queue(2))
  expect(res).toEqual([0, 0, 1, 2, 2, 4, 3, 6, 4, 8, 5, 10])
})

test('asyncFlatMap one exception', async () => {
  const arr = [...range(3)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  try {
    const d = new Deferred()
    const p = asyncFlatMap(arr, async (x) => {
      called[x] += 1
      await d.promise
      if (x === 1) {
        throw new Error('test')
      }
      return [x, x * 2]
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

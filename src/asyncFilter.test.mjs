
import { expect, test } from '@jest/globals'
import asyncFilter from './asyncFilter.mjs'
import Deferred from './Deferred.mjs'
import { range } from 'itertools'

test('asyncFilter base', async () => {
  const arr = [...range(6)]
  const res = await asyncFilter(arr, async (x) => x % 2 === 0, 2)
  expect(res).toEqual([0, 2, 4])
})

test('asyncFilter no async', async () => {
  const arr = [...range(6)]
  const res = await asyncFilter(arr, (x) => x % 2 === 0, 2)
  expect(res).toEqual([0, 2, 4])
})

test('asyncFilter concurrency', async () => {
  const arr = [...range(6)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  const d = new Deferred()
  const ds = arr.map(() => new Deferred())
  const p = asyncFilter(arr, async (x) => {
    called[x] += 1
    ds[x].resolve()
    await d.promise
    return x % 2 === 0
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
  expect(res).toEqual([0, 2, 4])
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

test('asyncFilter infinite concurrency base', async () => {
  const arr = [...range(6)]
  const res = await asyncFilter(arr, async (x) => x % 2 === 0, Number.POSITIVE_INFINITY)
  expect(res).toEqual([0, 2, 4])
})

test('asyncFilter infinite concurrency no async', async () => {
  const arr = [...range(6)]
  const res = await asyncFilter(arr, (x) => x % 2 === 0, Number.POSITIVE_INFINITY)
  expect(res).toEqual([0, 2, 4])
})

test('asyncFilter infinite concurrency concurrency', async () => {
  const arr = [...range(6)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  const d = new Deferred()
  const ds = arr.map(() => new Deferred())
  const p = asyncFilter(arr, async (x) => {
    called[x] += 1
    ds[x].resolve()
    await d.promise
    return x % 2 === 0
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
  expect(res).toEqual([0, 2, 4])
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

test('asyncFilter concurrency 1 base', async () => {
  const arr = [...range(6)]
  const res = await asyncFilter(arr, async (x) => x % 2 === 0)
  expect(res).toEqual([0, 2, 4])
})

test('asyncFilter concurrency 1 no async', async () => {
  const arr = [...range(6)]
  const res = await asyncFilter(arr, (x) => x % 2 === 0)
  expect(res).toEqual([0, 2, 4])
})

test('asyncFilter concurrency 1 concurrency', async () => {
  const arr = [...range(6)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  const d = new Deferred()
  const ds = arr.map(() => new Deferred())
  const p = asyncFilter(arr, async (x) => {
    called[x] += 1
    ds[x].resolve()
    await d.promise
    return x % 2 === 0
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
  expect(res).toEqual([0, 2, 4])
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

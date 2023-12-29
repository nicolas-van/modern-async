
import { expect, test } from '@jest/globals'
import asyncForEach from './asyncForEach.mjs'
import Deferred from './Deferred.mjs'
import { range } from 'itertools'
import asyncDelay from './asyncDelay.mjs'

test('asyncForEach base', async () => {
  const arr = [...range(6)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  await asyncForEach(arr, async (x) => {
    called[x] += 1
  }, 2)
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

test('asyncForEach no async', async () => {
  const arr = [...range(6)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  await asyncForEach(arr, (x) => {
    called[x] += 1
  }, 2)
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

test('asyncForEach concurrency', async () => {
  const arr = [...range(6)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  const d = new Deferred()
  const ds = arr.map(() => new Deferred())
  const p = asyncForEach(arr, async (x) => {
    called[x] += 1
    ds[x].resolve()
    await d.promise
  }, 2)
  await ds[1].promise
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(0)
  expect(called[3]).toBe(0)
  expect(called[4]).toBe(0)
  expect(called[5]).toBe(0)
  await asyncDelay()
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(0)
  expect(called[3]).toBe(0)
  expect(called[4]).toBe(0)
  expect(called[5]).toBe(0)
  d.resolve()
  await p
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

test('asyncForEach infinite concurrency base', async () => {
  const arr = [...range(6)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  await asyncForEach(arr, async (x) => {
    called[x] += 1
  }, Number.POSITIVE_INFINITY)
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

test('asyncForEach infinite concurrency no async', async () => {
  const arr = [...range(6)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  await asyncForEach(arr, (x) => {
    called[x] += 1
  }, Number.POSITIVE_INFINITY)
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

test('asyncForEach infinite concurrency concurrency', async () => {
  const arr = [...range(6)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  const d = new Deferred()
  const ds = arr.map(() => new Deferred())
  const p = asyncForEach(arr, async (x) => {
    called[x] += 1
    ds[x].resolve()
    await d.promise
  }, Number.POSITIVE_INFINITY)
  await ds[5].promise
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
  d.resolve()
  await p
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

test('asyncForEach concurrency 1 base', async () => {
  const arr = [...range(6)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  await asyncForEach(arr, async (x) => {
    called[x] += 1
  })
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

test('asyncForEach concurrency 1 no async', async () => {
  const arr = [...range(6)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  await asyncForEach(arr, (x) => {
    called[x] += 1
  })
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

test('asyncForEach concurrency 1 concurrency', async () => {
  const arr = [...range(6)]
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  const d = new Deferred()
  const ds = arr.map(() => new Deferred())
  const p = asyncForEach(arr, async (x) => {
    called[x] += 1
    ds[x].resolve()
    await d.promise
  })
  await ds[0].promise
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(0)
  expect(called[2]).toBe(0)
  expect(called[3]).toBe(0)
  expect(called[4]).toBe(0)
  expect(called[5]).toBe(0)
  d.resolve()
  await p
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

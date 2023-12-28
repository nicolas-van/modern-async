
import { expect, test } from '@jest/globals'
import Deferred from './Deferred.mjs'
import asyncReduce from './asyncReduce.mjs'
import { range } from 'itertools'
import asyncIterableWrap from './asyncIterableWrap.mjs'

test('asyncReduce base', async () => {
  const arr = [...range(6)]
  const d = new Deferred()
  const p = asyncReduce(arr, async (p, v) => {
    await d.promise
    return p + v
  }, 0)
  d.resolve()
  const result = await p
  expect(result).toEqual(arr.reduce((p, v) => p + v), 0)
})

test('asyncReduce no accumulator', async () => {
  const arr = [...range(6)]
  const d = new Deferred()
  const p = asyncReduce(arr, async (p, v) => {
    await d.promise
    return p + v
  })
  d.resolve()
  const result = await p
  expect(result).toEqual(arr.reduce((p, v) => p + v))
})

test('asyncReduce no async', async () => {
  const arr = [...range(6)]
  const result = await asyncReduce(arr, (p, v) => {
    return p + v
  }, 0)
  expect(result).toEqual(arr.reduce((p, v) => p + v), 0)
})

test('asyncReduce no async exception', async () => {
  const arr = [...range(6)]
  const p = asyncReduce(arr, (p, v) => {
    throw new Error('test')
  }, 0)
  try {
    await p
    expect(true).toBe(false)
  } catch (e) {
    expect(e.message).toBe('test')
  }
})

test('asyncReduce one', async () => {
  const arr = [1]
  const result = await asyncReduce(arr, (p, v) => p + v)
  expect(result).toEqual(arr.reduce((p, v) => p + v))
})

test('asyncReduce no args', async () => {
  const arr = []
  try {
    await asyncReduce(arr, (p, v) => p + v)
    expect(true).toBe(false)
  } catch (e) {
    expect(e).toBeInstanceOf(TypeError)
  }
})

test('asyncReduce iterable', async () => {
  const arr = [...range(6)]
  const result = await asyncReduce(arr, async (p, v, index, iterable) => {
    expect(iterable).toBe(arr)
    return p + v
  })
  expect(result).toEqual(arr.reduce((p, v) => p + v))
})

test('asyncReduce index', async () => {
  const arr = [...range(6)]
  arr.reduce((p, v, i) => {
    expect(i).toBe(v)
    return v
  })
  arr.reduce((p, v, i) => {
    expect(i).toBe(v)
    return v
  }, 0)
  await asyncReduce(arr, async (p, v, i) => {
    expect(i).toBe(v)
  })
  await asyncReduce(arr, async (p, v, i) => {
    expect(i).toBe(v)
  }, 0)
})

test('asyncReduce async generator', async () => {
  const gen = asyncIterableWrap(range(6))
  const d = new Deferred()
  const p = asyncReduce(gen, async (p, v) => {
    await d.promise
    return p + v
  }, 0)
  d.resolve()
  const result = await p
  expect(result).toEqual([...range(6)].reduce((p, v) => p + v), 0)
})

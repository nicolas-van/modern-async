
import { expect, test } from '@jest/globals'
import Deferred from './Deferred.mjs'
import reduce from './reduce.mjs'
import { range } from 'itertools'
import asyncIterableWrap from './asyncIterableWrap.mjs'

test('reduce base', async () => {
  const arr = [...range(6)]
  const d = new Deferred()
  const p = reduce(arr, async (p, v) => {
    await d.promise
    return p + v
  }, 0)
  d.resolve()
  const result = await p
  expect(result).toEqual(arr.reduce((p, v) => p + v), 0)
})

test('reduce no accumulator', async () => {
  const arr = [...range(6)]
  const d = new Deferred()
  const p = reduce(arr, async (p, v) => {
    await d.promise
    return p + v
  })
  d.resolve()
  const result = await p
  expect(result).toEqual(arr.reduce((p, v) => p + v))
})

test('reduce no async', async () => {
  const arr = [...range(6)]
  const result = await reduce(arr, (p, v) => {
    return p + v
  }, 0)
  expect(result).toEqual(arr.reduce((p, v) => p + v), 0)
})

test('reduce no async exception', async () => {
  const arr = [...range(6)]
  const p = reduce(arr, (p, v) => {
    throw new Error('test')
  }, 0)
  try {
    await p
    expect(true).toBe(false)
  } catch (e) {
    expect(e.message).toBe('test')
  }
})

test('reduce one', async () => {
  const arr = [1]
  const result = await reduce(arr, (p, v) => p + v)
  expect(result).toEqual(arr.reduce((p, v) => p + v))
})

test('reduce no args', async () => {
  const arr = []
  try {
    await reduce(arr, (p, v) => p + v)
    expect(true).toBe(false)
  } catch (e) {
    expect(e).toBeInstanceOf(TypeError)
  }
})

test('reduce iterable', async () => {
  const arr = [...range(6)]
  const result = await reduce(arr, async (p, v, index, iterable) => {
    expect(iterable).toBe(arr)
    return p + v
  })
  expect(result).toEqual(arr.reduce((p, v) => p + v))
})

test('reduce index', async () => {
  const arr = [...range(6)]
  arr.reduce((p, v, i) => {
    expect(i).toBe(v)
    return v
  })
  arr.reduce((p, v, i) => {
    expect(i).toBe(v)
    return v
  }, 0)
  await reduce(arr, async (p, v, i) => {
    expect(i).toBe(v)
  })
  await reduce(arr, async (p, v, i) => {
    expect(i).toBe(v)
  }, 0)
})

test('reduce async generator', async () => {
  const gen = asyncIterableWrap(range(6))
  const d = new Deferred()
  const p = reduce(gen, async (p, v) => {
    await d.promise
    return p + v
  }, 0)
  d.resolve()
  const result = await p
  expect(result).toEqual([...range(6)].reduce((p, v) => p + v), 0)
})


import { expect, test } from '@jest/globals'
import waitPrecise from './waitPrecise'
import reduce from './reduce'
import _ from 'lodash'

test('reduce base', async () => {
  const arr = _.range(6)
  const result = await reduce(arr, async (p, v) => {
    await waitPrecise(1)
    return p + v
  }, 0)
  expect(result).toEqual(arr.reduce((p, v) => p + v), 0)
})

test('reduce no accumulator', async () => {
  const arr = _.range(6)
  const result = await reduce(arr, async (p, v) => {
    await waitPrecise(1)
    return p + v
  })
  expect(result).toEqual(arr.reduce((p, v) => p + v))
})

test('reduce no async', async () => {
  const arr = _.range(6)
  const result = await reduce(arr, (p, v) => {
    return p + v
  }, 0)
  expect(result).toEqual(arr.reduce((p, v) => p + v), 0)
})

test('reduce no async exception', async () => {
  const arr = _.range(6)
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

test('reduce index & iterable', async () => {
  const arr = _.range(6)
  const result = await reduce(arr, async (p, v, index, iterable) => {
    expect(index).toBe(v)
    expect(iterable).toBe(arr)
    return p + v
  }, 0)
  expect(result).toEqual(arr.reduce((p, v) => p + v), 0)
})

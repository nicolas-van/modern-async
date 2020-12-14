
import { expect, test } from '@jest/globals'
import findIndexLimit from './findIndexLimit.mjs'
import _ from 'lodash'
import sleepPrecise from './sleepPrecise.mjs'

test('findIndexLimit compatibility', async () => {
  let res = await findIndexLimit(_.range(3), async (v) => {
    await sleepPrecise(10)
    return v === 2
  }, 1)
  expect(res).toBe(_.range(3).findIndex((v) => v === 2))

  res = await findIndexLimit(_.range(3), async (v) => {
    await sleepPrecise(10)
    return v === 5
  }, 1)
  expect(res).toBe(_.range(3).findIndex((v) => v === 5))

  res = await findIndexLimit([], async (v) => {
    await sleepPrecise(10)
    return v === 5
  }, 1)
  expect(res).toBe([].findIndex((v) => v === 5))
})

test('findIndexLimit cancelSubsequent', async () => {
  const callCount = {}
  _.range(3).forEach((i) => { callCount[i] = 0 })
  const res = await findIndexLimit(_.range(3), async (v, i) => {
    callCount[i] += 1
    await sleepPrecise(10)
    return v === 0
  }, 1)
  expect(res).toBe(0)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
})

test('findIndexLimit cancelSubsequent 2', async () => {
  const callCount = {}
  _.range(6).forEach((i) => { callCount[i] = 0 })
  const res = await findIndexLimit(_.range(6), async (v, i) => {
    callCount[i] += 1
    await sleepPrecise(10)
    return v === 0
  }, 2)
  expect(res === 0 || res === 1).toBe(true)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(0)
  expect(callCount[3]).toBe(0)
  expect(callCount[4]).toBe(0)
  expect(callCount[5]).toBe(0)
})

test('findIndexLimit find first in time', async () => {
  const arr = [0, 1, 0]
  let res = await findIndexLimit(arr, async (v, index) => {
    if (index === 0) {
      await sleepPrecise(10)
    } else {
      await sleepPrecise(100)
    }
    return v === 0
  }, 3)
  expect(res).toBe(0)

  res = await findIndexLimit(arr, async (v, index) => {
    if (index === 0) {
      await sleepPrecise(100)
    } else {
      await sleepPrecise(10)
    }
    return v === 0
  }, 3)
  expect(res).toBe(2)
})

test('findIndexLimit error', async () => {
  const arr = [0, 1, 2]
  try {
    await findIndexLimit(arr, async (v, index) => {
      if (index === 1) {
        throw new Error('test')
      } else {
        await sleepPrecise(100)
      }
      return v === 2
    }, 3)
    expect(false).toBe(true)
  } catch (e) {
    expect(e.message).toBe('test')
  }
})

test('findIndexLimit error after completion', async () => {
  const arr = [0, 1]
  const res = await findIndexLimit(arr, async (v, index) => {
    if (index === 0) {
      await sleepPrecise(10)
      return true
    } else {
      await sleepPrecise(100)
      throw new Error('should be ignored')
    }
  }, 2)
  expect(res).toBe(0)
})

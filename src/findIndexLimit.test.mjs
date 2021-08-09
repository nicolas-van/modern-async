
import { expect, test } from '@jest/globals'
import findIndexLimit from './findIndexLimit.mjs'
import _ from 'lodash'
import Deferred from './Deferred.mjs'

test('findIndexLimit compatibility', async () => {
  let d = new Deferred()
  let p = findIndexLimit(_.range(3), async (v) => {
    await d.promise
    return v === 2
  }, 1)
  d.resolve()
  expect(await p).toBe(_.range(3).findIndex((v) => v === 2))

  d = new Deferred()
  p = findIndexLimit(_.range(3), async (v) => {
    await d.promise
    return v === 5
  }, 1)
  d.resolve()
  expect(await p).toBe(_.range(3).findIndex((v) => v === 5))

  d = new Deferred()
  p = findIndexLimit([], async (v) => {
    await d.promise
    return v === 5
  }, 1)
  d.resolve()
  expect(await p).toBe([].findIndex((v) => v === 5))
})

test('findIndexLimit cancelSubsequent', async () => {
  const callCount = {}
  _.range(3).forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const p = findIndexLimit(_.range(3), async (v, i) => {
    callCount[i] += 1
    await d.promise
    return v === 0
  }, 1)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
  d.resolve()
  const res = await p
  expect(res).toBe(0)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
})

test('findIndexLimit cancelSubsequent 2', async () => {
  const callCount = {}
  _.range(6).forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const p = findIndexLimit(_.range(6), async (v, i) => {
    callCount[i] += 1
    await d.promise
    return v === 0
  }, 2)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(0)
  expect(callCount[3]).toBe(0)
  expect(callCount[4]).toBe(0)
  expect(callCount[5]).toBe(0)
  d.resolve()
  const res = await p
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
  let d1 = new Deferred()
  let d2 = new Deferred()
  let p = findIndexLimit(arr, async (v, index) => {
    if (index === 0) {
      await d1.promise
    } else {
      await d2.promise
    }
    return v === 0
  }, 3)
  d1.resolve()
  let res = await p
  expect(res).toBe(0)
  d2.resolve()

  d1 = new Deferred()
  d2 = new Deferred()
  p = findIndexLimit(arr, async (v, index) => {
    if (index === 0) {
      await d1.promise
    } else {
      await d2.promise
    }
    return v === 0
  }, 3)
  d2.resolve()
  res = await p
  expect(res).toBe(2)
  d1.resolve()
})

test('findIndexLimit error', async () => {
  const arr = [0, 1, 2]
  try {
    const d = new Deferred()
    const p = findIndexLimit(arr, async (v, index) => {
      if (index === 1) {
        throw new Error('test')
      } else {
        await d.promise
      }
      return v === 2
    }, 3)
    d.resolve()
    await p
    expect(false).toBe(true)
  } catch (e) {
    expect(e.message).toBe('test')
  }
})

test('findIndexLimit error after completion', async () => {
  const arr = [0, 1]
  const d1 = new Deferred()
  const d2 = new Deferred()
  const p = findIndexLimit(arr, async (v, index) => {
    if (index === 0) {
      await d1.promise
      return true
    } else {
      await d2.promise
      throw new Error('should be ignored')
    }
  }, 2)
  d1.resolve()
  d2.resolve()
  const res = await p
  expect(res).toBe(0)
})

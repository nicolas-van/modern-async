
import { expect, test } from '@jest/globals'
import someLimit from './someLimit.mjs'
import _ from 'lodash'
import sleepPrecise from './sleepPrecise.mjs'

test('someLimit compatibility', async () => {
  let res = await someLimit(_.range(3), async (v) => {
    await sleepPrecise(10)
    return true
  }, 1)
  expect(res).toBe(_.range(3).some((v) => true))

  res = await someLimit(_.range(3), async (v) => {
    await sleepPrecise(10)
    return v !== 2
  }, 1)
  expect(res).toBe(_.range(3).some((v) => v !== 2))

  res = await someLimit(_.range(3), async (v) => {
    await sleepPrecise(10)
    return false
  }, 1)
  expect(res).toBe(_.range(3).some((v) => false))

  res = await someLimit([], async (v) => {
    await sleepPrecise(10)
    return false
  }, 1)
  expect(res).toBe([].some((v) => false))

  res = await someLimit([], async (v) => {
    await sleepPrecise(10)
    return true
  }, 1)
  expect(res).toBe([].some((v) => true))
})

test('someLimit parallel', async () => {
  let res = await someLimit(_.range(3), async (v) => {
    await sleepPrecise(10)
    return true
  }, 10)
  expect(res).toBe(_.range(3).some((v) => true))

  res = await someLimit(_.range(3), async (v) => {
    await sleepPrecise(10)
    return v !== 2
  }, 10)
  expect(res).toBe(_.range(3).some((v) => v !== 2))

  res = await someLimit(_.range(3), async (v) => {
    await sleepPrecise(10)
    return false
  }, 10)
  expect(res).toBe(_.range(3).some((v) => false))

  res = await someLimit([], async (v) => {
    await sleepPrecise(10)
    return false
  }, 10)
  expect(res).toBe([].some((v) => false))

  res = await someLimit([], async (v) => {
    await sleepPrecise(10)
    return true
  }, 10)
  expect(res).toBe([].some((v) => true))
})

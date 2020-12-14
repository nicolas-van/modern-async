
import { expect, test } from '@jest/globals'
import map from './map.mjs'
import _ from 'lodash'
import sleepPrecise from './sleepPrecise.mjs'

test('map base', async () => {
  const arr = _.range(6)
  const res = await map(arr, async (x) => x * 2)
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
})

test('map no async', async () => {
  const arr = _.range(6)
  const res = await map(arr, (x) => x * 2)
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
})

test('map concurrency', async () => {
  const unit = 30
  const arr = _.range(6)
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  const p = map(arr, async (x) => {
    called[x] += 1
    await sleepPrecise(unit)
    return x * 2
  })
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
  const res = await p
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})


import { expect, test } from '@jest/globals'
import filterSeries from './filterSeries.mjs'
import _ from 'lodash'
import sleepPrecise from './sleepPrecise.mjs'

test('filterSeries base', async () => {
  const arr = _.range(6)
  const res = await filterSeries(arr, async (x) => x % 2 === 0)
  expect(res).toEqual([0, 2, 4])
})

test('filterSeries no async', async () => {
  const arr = _.range(6)
  const res = await filterSeries(arr, (x) => x % 2 === 0)
  expect(res).toEqual([0, 2, 4])
})

test('filterSeries concurrency', async () => {
  const unit = 30
  const arr = _.range(6)
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  const p = filterSeries(arr, async (x) => {
    called[x] += 1
    await sleepPrecise(unit)
    return x % 2 === 0
  })
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(0)
  expect(called[2]).toBe(0)
  expect(called[3]).toBe(0)
  expect(called[4]).toBe(0)
  expect(called[5]).toBe(0)
  const res = await p
  expect(res).toEqual([0, 2, 4])
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

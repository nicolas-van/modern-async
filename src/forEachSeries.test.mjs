
import { expect, test } from '@jest/globals'
import forEachSeries from './forEachSeries.mjs'
import _ from 'lodash'
import sleepPrecise from './sleepPrecise.mjs'

test('forEachSeries base', async () => {
  const arr = _.range(6)
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  await forEachSeries(arr, async (x) => {
    called[x] += 1
  })
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

test('forEachSeries no async', async () => {
  const arr = _.range(6)
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  await forEachSeries(arr, (x) => {
    called[x] += 1
  })
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

test('forEachSeries concurrency', async () => {
  const unit = 30
  const arr = _.range(6)
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  const p = forEachSeries(arr, async (x) => {
    called[x] += 1
    await sleepPrecise(unit)
  })
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(0)
  expect(called[2]).toBe(0)
  expect(called[3]).toBe(0)
  expect(called[4]).toBe(0)
  expect(called[5]).toBe(0)
  await p
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

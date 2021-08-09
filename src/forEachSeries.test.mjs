
import { expect, test } from '@jest/globals'
import forEachSeries from './forEachSeries.mjs'
import _ from 'lodash'
import Deferred from './Deferred.mjs'

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
  const arr = _.range(6)
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  const d = new Deferred()
  const p = forEachSeries(arr, async (x) => {
    called[x] += 1
    await d.promise
  })
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

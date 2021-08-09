
import { expect, test } from '@jest/globals'
import forEachLimit from './forEachLimit.mjs'
import _ from 'lodash'
import Deferred from './Deferred.mjs'

test('forEachLimit base', async () => {
  const arr = _.range(6)
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  await forEachLimit(arr, async (x) => {
    called[x] += 1
  }, 2)
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

test('forEachLimit no async', async () => {
  const arr = _.range(6)
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  await forEachLimit(arr, (x) => {
    called[x] += 1
  }, 2)
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
  expect(called[2]).toBe(1)
  expect(called[3]).toBe(1)
  expect(called[4]).toBe(1)
  expect(called[5]).toBe(1)
})

test('forEachLimit concurrency', async () => {
  const arr = _.range(6)
  const called = {}
  arr.forEach((v) => { called[v] = 0 })
  const d = new Deferred()
  const p = forEachLimit(arr, async (x) => {
    called[x] += 1
    await d.promise
  }, 2)
  expect(called[0]).toBe(1)
  expect(called[1]).toBe(1)
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

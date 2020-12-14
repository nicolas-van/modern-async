
import { expect, test } from '@jest/globals'
import findLimit from './findLimit.mjs'
import _ from 'lodash'
import sleepPrecise from './sleepPrecise.mjs'

test('findLimit', async () => {
  const arr = ['a', 'b', 'c']
  const callCount = {}
  _.range(3).forEach((i) => { callCount[i] = 0 })
  const res = await findLimit(arr, async (v, i) => {
    callCount[i] += 1
    await sleepPrecise(10)
    return v === 'b'
  }, 1)
  expect(res).toBe('b')
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(0)
})

test('findLimit not found', async () => {
  const arr = ['a', 'b', 'c']
  const callCount = {}
  _.range(3).forEach((i) => { callCount[i] = 0 })
  const res = await findLimit(arr, async (v, i) => {
    callCount[i] += 1
    await sleepPrecise(10)
    return v === 'd'
  }, 1)
  expect(res).toBe(arr.find((v) => v === 'd'))
})

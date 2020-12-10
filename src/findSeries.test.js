
import { expect, test } from '@jest/globals'
import findSeries from './findSeries'
import _ from 'lodash'
import sleepPrecise from './sleepPrecise'

test('findSeries', async () => {
  const arr = ['a', 'b', 'c']
  const callCount = {}
  _.range(3).forEach((i) => { callCount[i] = 0 })
  const res = await findSeries(arr, async (v, i) => {
    callCount[i] += 1
    await sleepPrecise(10)
    return v === 'b'
  })
  expect(res).toBe('b')
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(0)
})

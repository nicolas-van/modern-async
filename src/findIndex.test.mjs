
import { expect, test } from '@jest/globals'
import findIndex from './findIndex.mjs'
import _ from 'lodash'
import sleepPrecise from './sleepPrecise.mjs'

test('findIndex', async () => {
  const callCount = {}
  _.range(3).forEach((i) => { callCount[i] = 0 })
  const res = await findIndex(_.range(3), async (v, i) => {
    callCount[i] += 1
    await sleepPrecise(10)
    return v === 0
  })
  expect(res).toBe(0)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
})


import { expect, test } from '@jest/globals'
import every from './every'
import _ from 'lodash'
import sleepPrecise from './sleepPrecise'

test('every all pass', async () => {
  const callCount = {}
  _.range(3).forEach((i) => { callCount[i] = 0 })
  const res = await every(_.range(3), async (v, i) => {
    callCount[i] += 1
    await sleepPrecise(10)
    return true
  })
  expect(res).toBe(true)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
})

test('every no all pass', async () => {
  const callCount = {}
  _.range(3).forEach((i) => { callCount[i] = 0 })
  const res = await every(_.range(3), async (v, i) => {
    callCount[i] += 1
    await sleepPrecise(10)
    if (i === 1) {
      return false
    } else {
      return true
    }
  })
  expect(res).toBe(false)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
})

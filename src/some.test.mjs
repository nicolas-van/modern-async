
import { expect, test } from '@jest/globals'
import some from './some'
import _ from 'lodash'
import sleepPrecise from './sleepPrecise'

test('some all no pass', async () => {
  const callCount = {}
  _.range(3).forEach((i) => { callCount[i] = 0 })
  const res = await some(_.range(3), async (v, i) => {
    callCount[i] += 1
    await sleepPrecise(10)
    return false
  })
  expect(res).toBe(false)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
})

test('some some pass', async () => {
  const callCount = {}
  _.range(3).forEach((i) => { callCount[i] = 0 })
  const res = await some(_.range(3), async (v, i) => {
    callCount[i] += 1
    await sleepPrecise(10)
    if (i === 1) {
      return true
    } else {
      return false
    }
  })
  expect(res).toBe(true)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
})

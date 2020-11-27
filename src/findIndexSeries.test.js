
import { expect, test } from '@jest/globals'
import findIndexSeries from './findIndexSeries'
import _ from 'lodash'
import waitPrecise from './waitPrecise'

test('findIndexSeries', async () => {
  const callCount = {}
  _.range(3).forEach((i) => { callCount[i] = 0 })
  const res = await findIndexSeries(_.range(3), async (v, i) => {
    callCount[i] += 1
    await waitPrecise(10)
    return v === 0
  })
  expect(res).toBe(0)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
})

test('findIndexSeries ordered', async () => {
  const callCount = {}
  _.range(3).forEach((i) => { callCount[i] = 0 })
  const res = await findIndexSeries(_.range(3), async (v, i) => {
    callCount[i] += 1
    if (i === 0) {
      await waitPrecise(100)
    }
    return true
  })
  expect(res).toBe(0)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
})

test('findIndexSeries error', async () => {
  const callCount = {}
  _.range(3).forEach((i) => { callCount[i] = 0 })
  try {
    await findIndexSeries(_.range(3), async (v, i) => {
      callCount[i] += 1
      if (i === 0) {
        throw new Error('test')
      }
      return true
    })
    expect(true).toBe(false)
  } catch (e) {
    expect(e.message).toBe('test')
  }
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
})

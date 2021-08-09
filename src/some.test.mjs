
import { expect, test } from '@jest/globals'
import some from './some.mjs'
import _ from 'lodash'
import Deferred from './Deferred.mjs'

test('some all no pass', async () => {
  const callCount = {}
  _.range(3).forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const p = some(_.range(3), async (v, i) => {
    callCount[i] += 1
    await d.promise
    return false
  })
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  d.resolve()
  const res = await p
  expect(res).toBe(false)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
})

test('some some pass', async () => {
  const callCount = {}
  _.range(3).forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const p = some(_.range(3), async (v, i) => {
    callCount[i] += 1
    await d.promise
    if (i === 1) {
      return true
    } else {
      return false
    }
  })
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  d.resolve()
  const res = await p
  expect(res).toBe(true)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
})

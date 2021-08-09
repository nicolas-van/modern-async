
import { expect, test } from '@jest/globals'
import everySeries from './everySeries.mjs'
import _ from 'lodash'
import Deferred from './Deferred.mjs'

test('everySeries all pass', async () => {
  const callCount = {}
  _.range(3).forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const p = everySeries(_.range(3), async (v, i) => {
    callCount[i] += 1
    await d.promise
    return true
  })
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
  d.resolve()
  const res = await p
  expect(res).toBe(true)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
})

test('everySeries no all pass', async () => {
  const callCount = {}
  _.range(3).forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const p = everySeries(_.range(3), async (v, i) => {
    callCount[i] += 1
    await d.promise
    if (i === 1) {
      return false
    } else {
      return true
    }
  })
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
  d.resolve()
  const res = await p
  expect(res).toBe(false)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(0)
})

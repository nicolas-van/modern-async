
import { expect, test } from '@jest/globals'
import everySeries from './everySeries.mjs'
import Deferred from './Deferred.mjs'
import { range } from 'itertools'
import delay from './delay.mjs'

// eslint-disable-next-line require-jsdoc
class TestError extends Error {}

test('everySeries all pass', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = everySeries([...range(3)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    return true
  })
  await ds[0].promise
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
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = everySeries([...range(3)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    if (i === 1) {
      return false
    } else {
      return true
    }
  })
  await ds[0].promise
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

test('everySeries error', async () => {
  const callList = [...range(3)].map(() => 0)
  const p = everySeries([...range(3)], async (v, i) => {
    callList[i] += 1
    if (i === 1) {
      throw new TestError()
    }
    return true
  })
  try {
    await p
    expect(true).toStrictEqual(false)
  } catch (e) {
    expect(e).toBeInstanceOf(TestError)
  }
  await delay()
  expect(callList[0]).toStrictEqual(1)
  expect(callList[1]).toStrictEqual(1)
  expect(callList[2]).toStrictEqual(0)
})

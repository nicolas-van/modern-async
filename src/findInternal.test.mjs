
import { expect, test } from '@jest/globals'
import findInternal from './findInternal.mjs'
import mapGenerator from './mapGenerator.mjs'
import { range } from 'itertools'
import delay from './delay.mjs'
import Queue from './Queue.mjs'
import Deferred from './Deferred.mjs'
import sleep from './sleep.mjs'

// eslint-disable-next-line require-jsdoc
class TestError extends Error {}

test('findInternal fail in fetch', async () => {
  const originGen = mapGenerator(range(3), async (v, i) => {
    if (i === 1) {
      throw new TestError()
    }
    return v
  }, Number.POSITIVE_INFINITY)
  const callList = [...range(3)].map(() => 0)
  const [state, result] = await findInternal(originGen, async (v, i) => {
    callList[i] += 1
    return v === 2
  }, 1, true).then((r) => ['resolved', r], (e) => ['rejected', e])
  expect(state).toStrictEqual('rejected')
  expect(result).toBeInstanceOf(TestError)
  await delay()
  expect(callList[0]).toStrictEqual(1)
  expect(callList[1]).toStrictEqual(0)
  expect(callList[2]).toStrictEqual(0)
})

test('findInternal fail in fetch unordered', async () => {
  const originGen = mapGenerator(range(3), async (v, i) => {
    throw new TestError()
  }, Number.POSITIVE_INFINITY)
  const callList = [...range(3)].map(() => 0)
  const [state, result] = await findInternal(originGen, async (v, i) => {
    callList[i] += 1
    return v === 2
  }, 1, false).then((r) => ['resolved', r], (e) => ['rejected', e])
  expect(state).toStrictEqual('rejected')
  expect(result).toBeInstanceOf(TestError)
  await delay()
  expect(callList[0]).toStrictEqual(0)
  expect(callList[1]).toStrictEqual(0)
  expect(callList[2]).toStrictEqual(0)
})

test('findInternal cancel scheduled busy queue', async () => {
  const queue = new Queue(100)
  const d = new Deferred()
  const waiting = [...range(99)].map(() => {
    return queue.exec(async () => await d.promise)
  })
  const callList = []
  const [state, result] = await findInternal(range(100), async (x, i) => {
    callList.push(i)
    await sleep(1)
    if (i === 50) {
      throw new TestError()
    }
    return false
  }, queue).then((r) => ['resolved', r], (e) => ['rejected', e])
  expect(state).toStrictEqual('rejected')
  expect(result).toBeInstanceOf(TestError)

  d.resolve()
  await Promise.all(waiting)
  await delay()

  expect(callList).toStrictEqual([...range(51)])
})

test('findInternal infinite sync operator', async () => {
  let shouldStop = false
  const infiniteSyncGenerator = function * () {
    let i = 0
    while (true) {
      if (shouldStop) {
        return
      }
      yield i
      i += 1
    }
  }
  sleep(10).then(() => {
    shouldStop = true
  })
  const callList = []
  const [index] = await findInternal(infiniteSyncGenerator(), async (v, i) => {
    callList.push(i)
    await sleep(1)
    return false
  }, 1, true)
  expect(index).toStrictEqual(-1)
  expect(callList.length).toBeGreaterThanOrEqual(3)
  expect(callList[0]).toStrictEqual(0)
  expect(callList[1]).toStrictEqual(1)
  expect(callList[2]).toStrictEqual(2)
})

test('findInternal respect concurrency', async () => {
  const callList = []
  const d = new Deferred()
  const p = findInternal(range(10), async (el, i) => {
    callList.push(i)
    await d.promise
    return false
  }, 3)
  await delay()
  expect(callList).toStrictEqual([0, 1, 2])
  d.resolve()
  const [index] = await p
  expect(index).toStrictEqual(-1)
})

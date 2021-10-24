
import { expect, test } from '@jest/globals'
import findInternal from './findInternal.mjs'
import mapGenerator from './mapGenerator.mjs'
import { range } from 'itertools'
import delay from './delay.mjs'
import Queue from './Queue.mjs'
import Deferred from './Deferred.mjs'

// eslint-disable-next-line require-jsdoc
class TestError extends Error {}

test('findInternal fail in fetch', async () => {
  const originGen = mapGenerator(range(3), async (v, i) => {
    if (i === 1) {
      throw new TestError()
    }
    return v
  })
  const callList = [...range(3)].map(() => 0)
  const [state, result] = await findInternal(originGen, async (v, i) => {
    callList[i] += 1
    return v === 2
  }, 1).then((r) => ['resolved', r], (e) => ['rejected', e])
  expect(state).toStrictEqual('rejected')
  expect(result).toBeInstanceOf(TestError)
  await delay()
  expect(callList[0]).toStrictEqual(1)
  expect(callList[1]).toStrictEqual(0)
  expect(callList[2]).toStrictEqual(0)
})

test('findInternal fail in fetch unordered', async () => {
  const originGen = mapGenerator(range(3), async (v, i) => {
    if (i === 1) {
      throw new TestError()
    }
    return v
  })
  const queue = new Queue(1)
  const d = new Deferred()
  queue.exec(async () => await d.promise)
  const callList = [...range(3)].map(() => 0)
  const [state, result] = await findInternal(originGen, async (v, i) => {
    callList[i] += 1
    return v === 2
  }, queue, false).then((r) => ['resolved', r], (e) => ['rejected', e])
  expect(state).toStrictEqual('rejected')
  expect(result).toBeInstanceOf(TestError)
  d.resolve()
  await delay()
  expect(callList[0]).toStrictEqual(0)
  expect(callList[1]).toStrictEqual(0)
  expect(callList[2]).toStrictEqual(0)
})

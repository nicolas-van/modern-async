
import { expect, test } from '@jest/globals'
import asyncGeneratorMap from './asyncGeneratorMap.mjs'
import { range } from 'itertools'
import delay from './delay.mjs'
import Queue from './Queue.mjs'

test('asyncGeneratorMap base', async () => {
  const res = []
  for await (const el of asyncGeneratorMap(range(6), async (x) => x * 2, new Queue(1))) {
    res.push(el)
  }
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
})

test('asyncGeneratorMap all resolve in micro tasks', async () => {
  const del = delay()
  const gen = asyncGeneratorMap(range(6), async (x) => x, new Queue(1))
  let finished = false
  ;(async () => {
    const res = []
    for await (const el of gen) {
      res.push(el)
    }
    return res
  })().then(async (res) => {
    expect(res).toStrictEqual([...range(6)])
    finished = true
  })
  await del
  expect(finished).toBe(true)
})

test('asyncGeneratorMap infinity all resolve in micro tasks', async () => {
  const del = delay()
  const gen = asyncGeneratorMap(range(6), async (x) => x, new Queue(Number.POSITIVE_INFINITY))
  let finished = false
  ;(async () => {
    const res = []
    for await (const el of gen) {
      res.push(el)
    }
    return res
  })().then(async (res) => {
    expect(res).toStrictEqual([...range(6)])
    finished = true
  })
  await del
  expect(finished).toBe(true)
})

test('asyncGeneratorMap same queue three levels concurrency 1', async () => {
  const callList = []
  const queue = new Queue(1)
  const gen1 = asyncGeneratorMap(range(3), async (x, i) => {
    callList.push([0, i])
    return x * 2
  }, queue)
  const gen2 = asyncGeneratorMap(gen1, async (x, i) => {
    callList.push([1, i])
    return x * 2
  }, queue)
  const gen3 = asyncGeneratorMap(gen2, async (x, i) => {
    callList.push([2, i])
    return x * 2
  }, queue)
  const p = (async () => {
    const res = []
    for await (const el of gen3) {
      res.push(el)
    }
    return res
  })()
  const res = await p
  expect(res).toStrictEqual([0, 8, 16])
  expect(callList).toStrictEqual([
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [0, 2],
    [1, 2],
    [2, 2]
  ])
})

test('asyncGeneratorMap same queue three levels concurrency 2', async () => {
  const callList = []
  const queue = new Queue(2)
  const gen1 = asyncGeneratorMap(range(3), async (x, i) => {
    callList.push([0, i])
    return x * 2
  }, queue)
  const gen2 = asyncGeneratorMap(gen1, async (x, i) => {
    callList.push([1, i])
    return x * 2
  }, queue)
  const gen3 = asyncGeneratorMap(gen2, async (x, i) => {
    callList.push([2, i])
    return x * 2
  }, queue)
  const p = (async () => {
    const res = []
    for await (const el of gen3) {
      res.push(el)
    }
    return res
  })()
  const res = await p
  expect(res).toStrictEqual([0, 8, 16])
})

test('asyncGeneratorMap same queue three levels concurrency infinity', async () => {
  const callList = []
  const queue = new Queue(Number.POSITIVE_INFINITY)
  const gen1 = asyncGeneratorMap(range(3), async (x, i) => {
    callList.push([0, i])
    return x * 2
  }, queue)
  const gen2 = asyncGeneratorMap(gen1, async (x, i) => {
    callList.push([1, i])
    return x * 2
  }, queue)
  const gen3 = asyncGeneratorMap(gen2, async (x, i) => {
    callList.push([2, i])
    return x * 2
  }, queue)
  const p = (async () => {
    const res = []
    for await (const el of gen3) {
      res.push(el)
    }
    return res
  })()
  const res = await p
  expect(res).toStrictEqual([0, 8, 16])
})

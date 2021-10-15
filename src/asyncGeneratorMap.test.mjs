
import { expect, test } from '@jest/globals'
import asyncGeneratorMap from './asyncGeneratorMap.mjs'
import { range } from 'itertools'
import delay from './delay.mjs'

test('asyncGeneratorMap base', async () => {
  const res = []
  for await (const el of asyncGeneratorMap(range(6), async (x) => x * 2, 1)) {
    res.push(el)
  }
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
})

test('asyncGeneratorMap all resolve in micro tasks', async () => {
  const del = delay()
  const gen = asyncGeneratorMap(range(6), async (x) => x, 1)
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
  const gen = asyncGeneratorMap(range(6), async (x) => x, Number.POSITIVE_INFINITY)
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

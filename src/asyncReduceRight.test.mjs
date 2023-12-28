
import { expect, test } from '@jest/globals'
import asyncReduceRight from './asyncReduceRight.mjs'
import { range } from 'itertools'
import asyncIterableWrap from './asyncIterableWrap.mjs'
import Deferred from './Deferred.mjs'

test('asyncReduceRight base', async () => {
  const arr = [...range(6)]
  const result = await asyncReduceRight(arr, async (p, v) => {
    return p + v
  }, 0)
  expect(result).toEqual(arr.reduceRight((p, v) => p + v), 0)
})

test('asyncReduceRight no accumulator', async () => {
  const arr = [...range(6)]
  const result = await asyncReduceRight(arr, async (p, v) => {
    return p + v
  })
  expect(result).toEqual(arr.reduceRight((p, v) => p + v))
})

test('asyncReduceRight index', async () => {
  const arr = [...range(6)]
  arr.reduceRight((p, v, i) => {
    expect(i).toBe(v)
    return v
  })
  arr.reduceRight((p, v, i) => {
    expect(i).toBe(v)
    return v
  }, 0)
  await asyncReduceRight(arr, async (p, v, i) => {
    expect(i).toBe(v)
  })
  await asyncReduceRight(arr, async (p, v, i) => {
    expect(i).toBe(v)
  }, 0)
})

test('asyncReduceRight async generator', async () => {
  const gen = asyncIterableWrap(range(6))
  const d = new Deferred()
  const p = asyncReduceRight(gen, async (p, v) => {
    await d.promise
    return p + v
  }, 0)
  d.resolve()
  const result = await p
  expect(result).toEqual([...range(6)].reduceRight((p, v) => p + v), 0)
})

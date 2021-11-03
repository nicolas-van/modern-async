
import { expect, test } from '@jest/globals'
import reduceRight from './reduceRight.mjs'
import { range } from 'itertools'
import asyncIterableWrap from './asyncIterableWrap.mjs'
import Deferred from './Deferred.mjs'

test('reduceRight base', async () => {
  const arr = [...range(6)]
  const result = await reduceRight(arr, async (p, v) => {
    return p + v
  }, 0)
  expect(result).toEqual(arr.reduceRight((p, v) => p + v), 0)
})

test('reduceRight no accumulator', async () => {
  const arr = [...range(6)]
  const result = await reduceRight(arr, async (p, v) => {
    return p + v
  })
  expect(result).toEqual(arr.reduceRight((p, v) => p + v))
})

test('reduceRight index', async () => {
  const arr = [...range(6)]
  arr.reduceRight((p, v, i) => {
    expect(i).toBe(v)
    return v
  })
  arr.reduceRight((p, v, i) => {
    expect(i).toBe(v)
    return v
  }, 0)
  await reduceRight(arr, async (p, v, i) => {
    expect(i).toBe(v)
  })
  await reduceRight(arr, async (p, v, i) => {
    expect(i).toBe(v)
  }, 0)
})

test('reduceRight async generator', async () => {
  const gen = asyncIterableWrap(range(6))
  const d = new Deferred()
  const p = reduceRight(gen, async (p, v) => {
    await d.promise
    return p + v
  }, 0)
  d.resolve()
  const result = await p
  expect(result).toEqual([...range(6)].reduceRight((p, v) => p + v), 0)
})

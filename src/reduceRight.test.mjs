
import { expect, test } from '@jest/globals'
import reduceRight from './reduceRight.mjs'
import xrange from './xrange.mjs'

test('reduceRight base', async () => {
  const arr = [...xrange(6)]
  const result = await reduceRight(arr, async (p, v) => {
    return p + v
  }, 0)
  expect(result).toEqual(arr.reduceRight((p, v) => p + v), 0)
})

test('reduceRight no accumulator', async () => {
  const arr = [...xrange(6)]
  const result = await reduceRight(arr, async (p, v) => {
    return p + v
  })
  expect(result).toEqual(arr.reduceRight((p, v) => p + v))
})

test('reduceRight index', async () => {
  const arr = [...xrange(6)]
  arr.reduceRight((p, v, i) => {
    expect(i).toBe(v)
  })
  arr.reduceRight((p, v, i) => {
    expect(i).toBe(v)
  }, 0)
  await reduceRight(arr, async (p, v, i) => {
    expect(i).toBe(v)
  })
  await reduceRight(arr, async (p, v, i) => {
    expect(i).toBe(v)
  }, 0)
})

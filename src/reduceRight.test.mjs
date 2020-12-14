
import { expect, test } from '@jest/globals'
import reduceRight from './reduceRight'
import _ from 'lodash'

test('reduceRight base', async () => {
  const arr = _.range(6)
  const result = await reduceRight(arr, async (p, v) => {
    return p + v
  }, 0)
  expect(result).toEqual(arr.reduceRight((p, v) => p + v), 0)
})

test('reduceRight no accumulator', async () => {
  const arr = _.range(6)
  const result = await reduceRight(arr, async (p, v) => {
    return p + v
  })
  expect(result).toEqual(arr.reduceRight((p, v) => p + v))
})

test('reduceRight index', async () => {
  const arr = _.range(6)
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

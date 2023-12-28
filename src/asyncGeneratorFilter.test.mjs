
import { expect, test } from '@jest/globals'
import asyncGeneratorFilter from './asyncGeneratorFilter.mjs'
import { range } from 'itertools'

test('asyncGeneratorFilter base', async () => {
  const res = []
  for await (const el of asyncGeneratorFilter(range(6), async (x) => x % 2 === 0)) {
    res.push(el)
  }
  expect(res).toEqual([0, 2, 4])
})

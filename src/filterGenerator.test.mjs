
import { expect, test } from '@jest/globals'
import filterGenerator from './filterGenerator.mjs'
import { range } from 'itertools'

test('filterGenerator base', async () => {
  const res = []
  for await (const el of filterGenerator(range(6), async (x) => x % 2 === 0)) {
    res.push(el)
  }
  expect(res).toEqual([0, 2, 4])
})

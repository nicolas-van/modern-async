
import { expect, test } from '@jest/globals'
import asyncGeneratorMap from './asyncGeneratorMap.mjs'
import xrange from './xrange'

test('asyncGeneratorMap base', async () => {
  const res = []
  for await (const el of asyncGeneratorMap(xrange(6), async (x) => x * 2, 1)) {
    res.push(el)
  }
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
})

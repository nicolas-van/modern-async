
import { expect, test } from '@jest/globals'
import asyncGeneratorMap from './asyncGeneratorMap.mjs'
import _ from 'lodash'
import Queue from './Queue.mjs'

test('asyncGeneratorMap base', async () => {
  const queue = new Queue(1)
  const arr = _.range(6)
  const res = []
  for await (const el of asyncGeneratorMap(arr, async (x) => x * 2, queue)) {
    res.push(el)
  }
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
})


import { expect, test } from '@jest/globals'
import asyncSleepPrecise from './asyncSleepPrecise.mjs'

test('asyncSleepPrecise', async () => {
  const start = new Date().getTime()
  await asyncSleepPrecise(100)
  const end = new Date().getTime()
  expect(end - start).toBeGreaterThanOrEqual(100)
})

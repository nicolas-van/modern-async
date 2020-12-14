
import { expect, test } from '@jest/globals'
import sleepPrecise from './sleepPrecise.mjs'

test('sleepPrecise', async () => {
  const start = new Date().getTime()
  await sleepPrecise(100)
  const end = new Date().getTime()
  expect(end - start).toBeGreaterThanOrEqual(100)
})

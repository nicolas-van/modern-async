
import { expect, test } from '@jest/globals'
import asyncSleep from './asyncSleep.mjs'

test('asyncSleep', async () => {
  const start = new Date().getTime()
  await asyncSleep(100)
  const end = new Date().getTime()
  expect(end - start).toBeGreaterThanOrEqual(50)
})

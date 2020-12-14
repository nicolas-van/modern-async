
import { expect, test } from '@jest/globals'
import sleep from './sleep.mjs'

test('sleep', async () => {
  const start = new Date().getTime()
  await sleep(100)
  const end = new Date().getTime()
  expect(end - start).toBeGreaterThanOrEqual(50)
})

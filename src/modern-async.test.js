
import { expect, test } from '@jest/globals'
import * as modernAsync from './modern-async'

test('wait', async () => {
  const start = new Date().getTime()
  await modernAsync.wait(100)
  const end = new Date().getTime()
  expect(end - start).toBeGreaterThanOrEqual(100)
})

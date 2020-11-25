
import { expect, test } from '@jest/globals'
import wait from './wait'

test('wait', async () => {
  const start = new Date().getTime()
  await wait(100)
  const end = new Date().getTime()
  expect(end - start).toBeGreaterThanOrEqual(100)
})
